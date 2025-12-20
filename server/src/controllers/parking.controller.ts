
import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ParkingSession, ParkingStatus, VehicleType, PlanType } from '../entities/ParkingSession';
import { Shift } from '../entities/Shift';
import { Tariff, TariffType } from '../entities/Tariff';
import { Agreement, AgreementType } from '../entities/Agreement';
import { SystemSetting } from '../entities/SystemSetting';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { AuthRequest } from '../middleware/auth.middleware';

const calculateParkingCost = (session: ParkingSession, tariffs: Tariff[], gracePeriod: number) => {
    // Map tariffs for easy access
    const rateMap: Record<string, number> = {};
    tariffs.forEach(t => rateMap[t.tariffType] = Number(t.cost));

    const exitTime = new Date();
    const durationMs = exitTime.getTime() - session.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    let cost = 0;

    if (session.planType === PlanType.DAY) {
        // Simple day calculation: 1 day = 24 hours (1440 mins)
        // Adjust logic if "Day" means calendar day vs 24h block
        // Assuming 24h blocks for simplicity given current rate map usage
        // But if 'days' calculation logic is strictly ceil(duration / 1440), it's 24h blocks.
        const days = Math.ceil(durationMinutes / 1440);
        cost = days * (rateMap['DAY'] || 15000);
    } else {
        const hourRate = rateMap['HOUR'] || 3000;
        const fullHours = Math.floor(durationMinutes / 60);
        const remainderMinutes = durationMinutes % 60;

        let chargeableHours = fullHours;

        if (remainderMinutes > gracePeriod) {
            chargeableHours += 1;
        }

        if (chargeableHours === 0) {
            chargeableHours = 1;
        }

        cost = chargeableHours * hourRate;
    }

    return { cost, durationMinutes, exitTime };
};

export const entryVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate, vehicleType, planType, notes } = req.body;

    if (!plate || !vehicleType) {
        return res.status(400).json({ message: 'Plate and Vehicle Type are required' });
    }

    // Default plan to HOUR if not provided
    const selectedPlan = planType || PlanType.HOUR;

    // Find active shift for user
    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
    });

    if (!shift) {
        return res.status(400).json({ message: 'No active shift found. Open a shift first.' });
    }

    // Check for existing active session for this plate
    const existingSession = await em.findOne(ParkingSession, {
        plate,
        status: ParkingStatus.ACTIVE,
    });

    if (existingSession) {
        return res.status(400).json({ message: 'Vehicle already parked', session: existingSession });
    }

    // Check Capacity Logic
    const settingsList = await em.find(SystemSetting, {});
    const settings: Record<string, string> = {};
    settingsList.forEach(s => settings[s.key] = s.value);

    // Default to disabled ("false") if not set. User requested "infinite option" which is basically check_capacity = false
    const checkCapacity = settings['check_capacity'] === 'true';

    if (checkCapacity) {
        const capacityKey = vehicleType === VehicleType.CAR ? 'capacity_car' : 'capacity_motorcycle';
        // Default caps if missing
        const maxCapacity = Number(settings[capacityKey] || (vehicleType === VehicleType.CAR ? 50 : 30));

        const currentCount = await em.count(ParkingSession, {
            status: ParkingStatus.ACTIVE,
            vehicleType: vehicleType as VehicleType
        });

        if (currentCount >= maxCapacity) {
            return res.status(400).json({
                message: `No hay cupos disponibles para ${vehicleType === VehicleType.CAR ? 'Carros' : 'Motos'}. Capacidad máxima: ${maxCapacity} `
            });
        }
    }

    const session = em.create(ParkingSession, {
        plate,
        vehicleType: vehicleType as VehicleType,
        planType: selectedPlan,
        entryTime: new Date(),
        status: ParkingStatus.ACTIVE,
        entryShift: shift,
        notes,
    });

    await em.persistAndFlush(session);
    return res.status(201).json(session);
};

export const previewExit = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    const { plate } = req.params;

    const session = await em.findOne(ParkingSession, {
        plate,
        status: ParkingStatus.ACTIVE,
    });

    if (!session) {
        return res.status(404).json({ message: 'No active session' });
    }

    const tariffs = await em.find(Tariff, { vehicleType: session.vehicleType });
    const settingsList = await em.find(SystemSetting, {});
    const settings: Record<string, string> = {};
    settingsList.forEach(s => settings[s.key] = s.value);
    const gracePeriod = Number(settings['grace_period'] || 5);

    const result = calculateParkingCost(session, tariffs, gracePeriod);

    return res.json({
        plate: session.plate,
        entryTime: session.entryTime,
        planType: session.planType,
        ...result,
        hourlyRate: tariffs.find(t => t.tariffType === 'HOUR')?.cost || 0
    });
};

export const exitVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate, paymentMethod, discount, discountReason, agreementId } = req.body;

    if (!plate) {
        return res.status(400).json({ message: 'Plate is required' });
    }

    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
    });

    if (!shift) {
        return res.status(400).json({ message: 'No active shift found' });
    }

    const session = await em.findOne(ParkingSession, {
        plate,
        status: ParkingStatus.ACTIVE,
    });

    if (!session) {
        return res.status(404).json({ message: 'No active parking session found for this plate' });
    }

    const tariffs = await em.find(Tariff, { vehicleType: session.vehicleType });
    const settingsList = await em.find(SystemSetting, {});
    const settings: Record<string, string> = {};
    settingsList.forEach(s => settings[s.key] = s.value);
    const gracePeriod = Number(settings['grace_period'] || 5);

    let { cost: calculatedCost, durationMinutes, exitTime } = calculateParkingCost(session, tariffs, gracePeriod);

    // Apply Discount Strategy
    let finalCost = calculatedCost;
    let appliedDiscount = 0;
    let finalDiscountReason = discountReason || '';
    let appliedAgreement: Agreement | undefined;

    // Priority: Manual Discount OVERRIDES Agreement if both present? Or Agreement first?
    // Let's say: If Agreement is passed, use it. If Manual Discount is passed, use it.
    // If both.. Manual wins for specific override? Or additive? 
    // Logic: If agreementId is present, calculate discount from it. 
    // If manual discount is present, use that instead (override).

    if (agreementId) {
        const agreement = await em.findOne(Agreement, { id: Number(agreementId), isActive: true });
        if (agreement) {
            appliedAgreement = agreement;
            finalDiscountReason = agreement.name; // Set reason to agreement name automatically

            if (agreement.type === AgreementType.FREE_HOURS) {
                // Recalculate cost subtracting usage time? 
                // Or easier: Calculate cost of X hours and subtract?
                // Better: Modify calculation. 
                // Simple approach: Subtract value * hour_tariff from cost? 
                // Accurate approach: Subtract hours from duration and recalculate?
                // Let's try: Subtract hours from duration.
                const freeMinutes = agreement.value * 60;
                const paidMinutes = Math.max(0, durationMinutes - freeMinutes);

                // Hacky recalculation or just rough estimate?
                // Let's use the tariff for HOUR * value as the discount amount.
                // Assuming hour tariff exists.
                const hourTariff = tariffs.find(t => t.tariffType === 'HOUR');
                if (hourTariff) {
                    const discountAmount = hourTariff.cost * agreement.value;
                    appliedDiscount = Math.min(calculatedCost, discountAmount);
                    finalCost = calculatedCost - appliedDiscount;
                }
            } else if (agreement.type === AgreementType.PERCENTAGE) {
                appliedDiscount = (calculatedCost * agreement.value) / 100;
                finalCost = calculatedCost - appliedDiscount;
            } else if (agreement.type === AgreementType.FLAT_DISCOUNT) {
                appliedDiscount = Math.min(calculatedCost, Number(agreement.value));
                finalCost = calculatedCost - appliedDiscount;
            }
        }
    } else if (discount && Number(discount) > 0) {
        // Manual override
        appliedDiscount = Number(discount);
        finalCost = Math.max(0, calculatedCost - appliedDiscount);
    }

    session.exitTime = exitTime;
    session.cost = finalCost;
    session.status = ParkingStatus.COMPLETED;
    session.exitShift = shift;
    session.discount = appliedDiscount > 0 ? appliedDiscount : undefined;
    session.discountReason = finalDiscountReason;
    if (appliedAgreement) {
        session.agreement = appliedAgreement;
    }

    // Create Revenue Transaction
    const transaction = em.create(Transaction, {
        shift: shift,
        type: TransactionType.PARKING_REVENUE,
        description: `Parking[${session.planType}]: ${session.plate} (${Math.floor(durationMinutes)} mins)${appliedDiscount > 0 ? ` - DESC: $${appliedDiscount} (${finalDiscountReason})` : ''} `,
        amount: finalCost,
        paymentMethod: paymentMethod || PaymentMethod.CASH,
        timestamp: new Date(),
        discount: appliedDiscount > 0 ? appliedDiscount : undefined,
        discountReason: finalDiscountReason,
        agreement: appliedAgreement
    });
    em.persist(transaction);

    await em.flush();

    // Return all data needed for printing
    return res.json({
        id: session.id,
        plate: session.plate,
        vehicleType: session.vehicleType,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        planType: session.planType,
        cost: finalCost,
        originalCost: calculatedCost,
        discount: appliedDiscount,
        durationMinutes,
        agreementName: appliedAgreement?.name
    });
};

export const getActiveSessions = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const sessions = await em.find(ParkingSession, { status: ParkingStatus.ACTIVE }, { orderBy: { entryTime: 'DESC' } });
    return res.json(sessions);
};

export const publicStatus = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const { id } = req.params;

    // Support ID or Plate? QR usually uses ID for uniqueness. ID is safer for simple lookup.
    const session = await em.findOne(ParkingSession, {
        id: Number(id),
        status: ParkingStatus.ACTIVE
    });

    if (!session) {
        // If not active, maybe it's completed? Check history?
        // For now, only show active session status.
        return res.status(404).json({ message: 'No active session found or ticket invalid.' });
    }

    const tariffs = await em.find(Tariff, { vehicleType: session.vehicleType });
    const settingsList = await em.find(SystemSetting, {});
    const settings: Record<string, string> = {};
    settingsList.forEach(s => settings[s.key] = s.value);
    const gracePeriod = Number(settings['grace_period'] || 5);

    const { cost, durationMinutes } = calculateParkingCost(session, tariffs, gracePeriod);

    return res.json({
        id: session.id,
        plate: session.plate, // Mask partially? e.g. ***123
        vehicleType: session.vehicleType,
        entryTime: session.entryTime,
        planType: session.planType,
        cost,
        durationMinutes,
        currentTime: new Date()
    });
};
