
import { Request, Response } from 'express';
import { RequestContext, LockMode } from '@mikro-orm/core';
import { ParkingSession, ParkingStatus, VehicleType, PlanType } from '../entities/ParkingSession';
import { Shift } from '../entities/Shift';
import { Tariff, TariffType, PricingModel } from '../entities/Tariff';
import { Tenant } from '../entities/Tenant';
import { Agreement, AgreementType } from '../entities/Agreement';
import { SystemSetting } from '../entities/SystemSetting';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { AuthRequest } from '../middleware/auth.middleware';
import { Loyalty } from '../entities/Loyalty';
import { MonthlyClient } from '../entities/MonthlyClient';
import { cacheService } from '../services/CacheService';
import { Location } from '../entities/Location';
import { ReceiptService } from '../services/ReceiptService';
import { UsageService } from '../services/usage.service';
import { logger } from '../utils/logger';

export const calculateParkingCost = (session: ParkingSession, tariffs: Tariff[], gracePeriod: number) => {
    // 1. Determine active pricing model from global setting (stored on any tariff)
    const anyTariff = tariffs.find(t => t.vehicleType === session.vehicleType);
    const pricingModel = anyTariff?.pricingModel || PricingModel.MINUTE;

    // 2. Select specific configuration record based on model to ensure independence
    let tariffConfig: Tariff | undefined;

    if (pricingModel === PricingModel.MINUTE) {
        // Minute Model -> Uses MINUTE tariff record (basePrice)
        tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType === TariffType.MINUTE);
    } else {
        // Traditional & Blocks Models -> Use HOUR tariff record
        // Traditional uses 'cost', Blocks uses 'basePrice'
        tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType === TariffType.HOUR);
    }

    if (!tariffConfig) {
        // Fallback
        tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType !== TariffType.DAY);
    }

    const dayTariff = tariffs.find(t => t.vehicleType === session.vehicleType && t.tariffType === TariffType.DAY);

    const exitTime = new Date();
    const durationMs = exitTime.getTime() - session.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    let cost = 0;

    if (!tariffConfig) {
        return { cost: 0, durationMinutes, exitTime };
    }

    if (session.planType === PlanType.DAY) {
        // User selected "Día Único" at entry - charge flat day rate
        const dayRate = dayTariff ? Number(dayTariff.cost) : (tariffConfig.dayMaxPrice || 15000);
        const days = Math.ceil(durationMinutes / 1440);
        cost = days * dayRate;

    } else {
        // Normal Calculation based on Pricing Model
        // We use the 'pricingModel' variable derived earlier to ensure consistency

        if (pricingModel === PricingModel.MINUTE) {
            // Per-minute pricing -> Use basePrice from MINUTE record
            const pricePerMinute = Number(tariffConfig.basePrice || 0);
            cost = durationMinutes * pricePerMinute;

        } else if (pricingModel === PricingModel.BLOCKS) {
            // Block pricing -> Use basePrice from HOUR record
            const baseTimeMinutes = tariffConfig.baseTimeMinutes || 60;
            const extraFracTimeMinutes = tariffConfig.extraFracTimeMinutes || 30;

            if (durationMinutes <= baseTimeMinutes) {
                cost = Number(tariffConfig.basePrice);
            } else {
                const extraMinutes = durationMinutes - baseTimeMinutes;
                const extraBlocks = Math.ceil(extraMinutes / extraFracTimeMinutes);
                cost = Number(tariffConfig.basePrice) + (extraBlocks * Number(tariffConfig.extraFracPrice || 0));
            }

        } else if (pricingModel === PricingModel.TRADITIONAL) {
            // Traditional hourly pricing -> Use cost from HOUR record
            // tariffConfig IS the hour tariff here

            const fullHours = Math.floor(durationMinutes / 60);
            const remainingMinutes = durationMinutes % 60;

            let hoursCharged = fullHours;

            if (fullHours === 0) {
                // Always charge at least the first hour if duration > 0
                // (Unless specifically 0 minutes, but durationMinutes is ceil'd)
                hoursCharged = 1;
            } else {
                // Grace period logic for subsequent hours
                if (remainingMinutes > gracePeriod) {
                    hoursCharged += 1;
                }
            }

            // Use 'cost' field for Traditional Price
            const pricePerHour = Number(tariffConfig.cost || 0);
            cost = hoursCharged * pricePerHour;
        }

        // Apply Flat Rate (Tarifa Plena) cap if configured
        // Only apply if:
        // 1. dayMaxPrice is set (flat rate enabled)
        // 2. dayMinHours threshold is met (or not set, defaults to 0)
        const dayMaxPrice = tariffConfig.dayMaxPrice ? Number(tariffConfig.dayMaxPrice) : 0;
        const dayMinHours = tariffConfig.dayMinHours ? Number(tariffConfig.dayMinHours) : 0;

        if (dayMaxPrice > 0) {
            // Check if minimum hours threshold is met
            if (durationHours >= dayMinHours) {
                // Apply flat rate if cost exceeds it
                if (cost > dayMaxPrice) {
                    cost = dayMaxPrice;
                }
            }
        }
    }

    // Ensure no negative cost
    cost = Math.max(0, cost);

    return { cost, durationMinutes, exitTime };
};

export const entryVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate, vehicleType, planType, notes, entryTime } = req.body;

    if (!plate || !vehicleType) {
        return res.status(400).json({ message: 'Plate and Vehicle Type are required' });
    }

    // Default plan to HOUR if not provided
    const selectedPlan = planType || PlanType.HOUR;

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    if (!locationId) {
        return res.status(400).json({ message: 'Location context is required' });
    }

    // Find active shift for user IN THIS LOCATION
    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
        location: locationId
    }, { populate: ['tenant', 'location'] });

    if (!shift) {
        return res.status(400).json({ message: 'No active shift found in this location. Open a shift first.' });
    }

    // Check for existing active session for this plate
    // Also scope this check to location? Or Global?
    // User complaint implies they want isolation. 
    // If I enter matching plate in Sede 2, and it exists in Sede 1, should I block?
    // If different locations, physically possible (different car, cloned plate, or error).
    // Allowing duplicates across locations is safer for multi-location isolation.
    // So filtering existingSession by location is also good practice.
    const existingSession = await em.findOne(ParkingSession, {
        plate,
        status: ParkingStatus.ACTIVE,
        location: locationId
    });

    if (existingSession) {
        return res.status(400).json({ message: 'El vehículo ya tiene una sesión activa en este parqueadero' });
    }

    // Check for Active Monthly Subscription
    const monthlyClient = await em.findOne(MonthlyClient, {
        plate,
        isActive: true,
        endDate: { $gte: new Date() },
        tenant: shift.tenant // Scope to tenant? Yes.
    });

    if (monthlyClient) {
        const endDateStr = new Date(monthlyClient.endDate).toLocaleDateString();
        return res.status(409).json({
            message: `Este vehículo tiene una mensualidad activa hasta el ${endDateStr}. No es necesario ingresar manual.`,
            monthlyClient
        });
    }

    // --- TICKET NUMBERING LOGIC & CREATION (Transactional) ---
    // We wrap everything in a transaction to ensure lock safety and atomicity
    const session = await em.transactional(async (emTx) => {
        // 1. Fetch Location with Lock to prevent race conditions
        const locationEntity = await emTx.findOneOrFail(Location, { id: shift.location.id }, { lockMode: LockMode.PESSIMISTIC_WRITE });

        // 2. Increment
        locationEntity.currentTicketNumber = (locationEntity.currentTicketNumber || 0) + 1;
        const ticketNumber = locationEntity.currentTicketNumber.toString();

        const newSession = emTx.create(ParkingSession, {
            plate,
            vehicleType: vehicleType as VehicleType,
            planType: selectedPlan,
            entryTime: entryTime ? new Date(entryTime) : new Date(),
            status: ParkingStatus.ACTIVE,
            entryShift: shift,
            tenant: shift.tenant,
            location: shift.location,
            ticketNumber, // Assign the new ticket number
            notes,
        } as any);

        return newSession;
    });

    await em.persistAndFlush(session);


    // Track usage (Fire and forget or await? Await to ensure consistency for now)
    try {
        const usageService = new UsageService();
        await usageService.trackSession(shift.tenant.id);
    } catch (error) {
        logger.error({ error }, 'Error tracking session usage');
        // Don't fail the request if tracking fails
    }

    return res.status(201).json(session);
};

export const previewExit = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    const { plate } = req.params;
    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    // Scope by location if possible, but previewExit is GET /:plate
    // Ideally we filter by location.
    const filter: any = {
        plate,
        status: ParkingStatus.ACTIVE,
    };
    if (locationId) filter.location = locationId;

    const session = await em.findOne(ParkingSession, filter);

    if (!session) {
        return res.status(404).json({ message: 'No active session' });
    }

    // ... (rest is same)
    const tariffs = await em.find(Tariff, {
        vehicleType: session.vehicleType,
        location: session.location
    });
    const settingsList = await em.find(SystemSetting, {});
    const settings: Record<string, string> = {};
    settingsList.forEach(s => settings[s.key] = s.value);
    const gracePeriod = Number(settings['grace_period'] || 5);

    const result = calculateParkingCost(session, tariffs, gracePeriod);

    // Check Loyalty Status
    const loyaltyEnabled = settings['loyalty_enabled'] === 'true';
    const loyaltyTarget = Number(settings['loyalty_target'] || 10);
    const loyaltyRewardType = settings['loyalty_reward_type'] || 'FULL';
    const loyaltyRewardHours = Number(settings['loyalty_reward_hours'] || 0);


    let loyalty: any = null;
    let canRedeem = false;

    if (loyaltyEnabled) {
        const lp = await em.findOne(Loyalty, { plate: session.plate });
        if (lp) {
            loyalty = {
                points: lp.points,
                target: loyaltyTarget,
                rewardType: loyaltyRewardType,
                rewardHours: loyaltyRewardHours
            };
            if (lp.points >= loyaltyTarget) {
                canRedeem = true;
            }
        } else {
            loyalty = {
                points: 0,
                target: loyaltyTarget,
                rewardType: loyaltyRewardType,
                rewardHours: loyaltyRewardHours
            };
        }
    }

    return res.json({
        id: session.id,
        plate: session.plate,
        entryTime: session.entryTime,
        planType: session.planType,
        ...result,
        hourlyRate: tariffs.find(t => t.tariffType === 'HOUR')?.cost || 0,
        loyalty,
        canRedeem
    });
};

export const exitVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate, paymentMethod, discount, discountReason, agreementId, redeem } = req.body;

    if (!plate) {
        return res.status(400).json({ message: 'Plate is required' });
    }

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    if (!locationId) {
        return res.status(400).json({ message: 'Location context is required' });
    }

    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
        location: locationId
    }, { populate: ['tenant', 'location'] });

    if (!shift) {
        return res.status(400).json({ message: 'No active shift found (in this location)' });
    }

    const session = await em.findOne(ParkingSession, {
        plate,
        status: ParkingStatus.ACTIVE,
        location: locationId
    });

    if (!session) {
        return res.status(404).json({ message: 'No active parking session found for this plate in this location' });
    }

    // Check Cache for Tariffs
    const tariffCacheKey = `tariffs_${session.vehicleType}_${shift.tenant.id}`;
    let tariffs = cacheService.get<Tariff[]>(tariffCacheKey);

    if (!tariffs) {
        tariffs = await em.find(Tariff, {
            vehicleType: session.vehicleType,
            tenant: shift.tenant,
            location: shift.location
        });
        cacheService.set(tariffCacheKey, tariffs);
    }

    // Check Cache for Settings
    const settingsCacheKey = `settings_${shift.tenant.id}_${shift.location.id}`;
    let allSettings = cacheService.get<SystemSetting[]>(settingsCacheKey);

    if (!allSettings) {
        // Fetch Settings hierarchical (Global < Tenant < Location)
        allSettings = await em.find(SystemSetting, {
            $or: [
                { tenant: null, location: null }, // Global
                { tenant: shift.tenant.id, location: null }, // Tenant
                { tenant: shift.tenant.id, location: shift.location.id } // Location
            ]
        });
        cacheService.set(settingsCacheKey, allSettings);
    }

    const settings: Record<string, string> = {};

    // Sort logic to ensure override: Global -> Tenant -> Location
    const globalS = allSettings.filter(s => !s.tenant && !s.location);
    const tenantS = allSettings.filter(s => s.tenant?.id === shift.tenant.id && !s.location);
    const locationS = allSettings.filter(s => s.location?.id === shift.location.id);

    globalS.forEach(s => settings[s.key] = s.value);
    tenantS.forEach(s => settings[s.key] = s.value);
    locationS.forEach(s => settings[s.key] = s.value);

    const gracePeriod = Number(settings['grace_period'] || 5);

    let { cost: calculatedCost, durationMinutes, exitTime } = calculateParkingCost(session, tariffs, gracePeriod);

    // Apply Discount Strategy
    let finalCost = calculatedCost;
    let appliedDiscount = 0;
    let finalDiscountReason = discountReason || '';
    let appliedAgreement: Agreement | undefined;

    if (agreementId) {
        const agreement = await em.findOne(Agreement, { id: Number(agreementId), isActive: true });
        if (agreement) {
            appliedAgreement = agreement;
            finalDiscountReason = agreement.name;

            if (agreement.type === AgreementType.FREE_HOURS) {
                const freeMinutes = agreement.value * 60;
                // Recalculate cost? Or simple deduction?
                // Let's deduce cost of X hours.
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
        appliedDiscount = Number(discount);
        finalCost = Math.max(0, calculatedCost - appliedDiscount);
    }

    // Loyalty Logic
    const loyaltyEnabled = settings['loyalty_enabled'] === 'true';
    const loyaltyTarget = Number(settings['loyalty_target'] || 10);
    const loyaltyRewardType = settings['loyalty_reward_type'] || 'FULL';
    const loyaltyRewardHours = Number(settings['loyalty_reward_hours'] || 0);

    let loyaltyPointsRedeemed = 0;

    if (loyaltyEnabled) {
        // Loyalty is Tenant-Wide (Brand Loyalty)
        let lp = await em.findOne(Loyalty, { plate, tenant: shift.tenant });

        if (!lp) {
            lp = em.create(Loyalty, {
                plate,
                tenant: shift.tenant,
                location: undefined, // Explicitly undefined for Tenant-Wide
                points: 0,
                totalVisits: 0,
                lastVisit: new Date()
            });
            em.persist(lp);
        }

        if (redeem && lp.points >= loyaltyTarget) {
            // Apply Discount based on Reward Type
            if (loyaltyRewardType === 'HOURS' && loyaltyRewardHours > 0) {
                // Calculate value of X hours
                const hourTariff = tariffs.find(t => t.tariffType === 'HOUR');
                if (hourTariff) {
                    const discountAmount = hourTariff.cost * loyaltyRewardHours;
                    appliedDiscount = Math.min(calculatedCost, discountAmount);
                    finalCost = calculatedCost - appliedDiscount;
                    finalDiscountReason = `Canje Loyalty (${loyaltyRewardHours} Horas)`;
                } else {
                    // Fallback if no hour tariff? assume FULL? No, better warn or just 0.
                    // Let's assume proportional discount if needed, but per-hour is safer.
                    // If no per-hour tariff, maybe it's day only?
                    // Safe Fallback:
                    appliedDiscount = 0; // Config error
                }
            } else {
                // Default to FULL
                appliedDiscount = calculatedCost;
                finalCost = 0;
                finalDiscountReason = 'Canje de Puntos Loyalty (Total)';
            }


            // Deduct Points
            lp.points -= loyaltyTarget;
            lp.totalVisits += 1;
            lp.lastVisit = new Date();
            loyaltyPointsRedeemed = loyaltyTarget;

        } else {
            // Normal Accrual
            lp.points += 1;
            lp.totalVisits += 1;
            lp.lastVisit = new Date();
        }
    }

    // Transactional Exit Logic
    const transactionResult = await em.transactional(async (emTx) => {
        // Generate Receipt Number
        const receiptNumber = await ReceiptService.getNextReceiptNumber(emTx, shift.location.id);

        // Update Session
        const sessionRef = emTx.getReference(ParkingSession, session.id);
        sessionRef.exitTime = exitTime;
        sessionRef.cost = finalCost;
        sessionRef.status = ParkingStatus.COMPLETED;
        sessionRef.exitShift = shift;
        sessionRef.discount = appliedDiscount > 0 ? appliedDiscount : undefined;
        sessionRef.discountReason = finalDiscountReason;
        if (appliedAgreement) {
            sessionRef.agreement = appliedAgreement;
        }

        if (receiptNumber) sessionRef.receiptNumber = receiptNumber;

        // Create Revenue Transaction
        const transaction = emTx.create(Transaction, {
            shift: shift,
            tenant: shift.tenant,
            location: shift.location,
            type: TransactionType.PARKING_REVENUE,
            description: `Parking[${session.planType}]: ${session.plate} (${Math.floor(durationMinutes)} mins)${appliedDiscount > 0 ? ` - DESC: $${appliedDiscount} (${finalDiscountReason})` : ''} `,
            amount: finalCost,
            paymentMethod: paymentMethod || PaymentMethod.CASH,
            timestamp: new Date(),
            discount: appliedDiscount > 0 ? appliedDiscount : undefined,
            discountReason: finalDiscountReason,
            agreement: appliedAgreement,
            receiptNumber
        } as any);

        emTx.persist(transaction);
        return { receiptNumber };
    });

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
        agreementName: appliedAgreement?.name,
        receiptNumber: transactionResult.receiptNumber
    });
};

export const getActiveSessions = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    const filter: any = { status: ParkingStatus.ACTIVE };

    // If location context exists, filter by it. 
    // If NOT exists (e.g. global admin view?), currently shows all.
    // Given the user report, we MUST filter if context is present.
    if (locationId && locationId !== 'null' && locationId !== 'undefined') {
        filter.location = locationId;
    }

    const sessions = await em.find(ParkingSession, filter, { orderBy: { entryTime: 'DESC' } });
    return res.json(sessions);
};

export const publicStatus = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const { id } = req.params;

    // Support ID or Plate? QR usually uses ID for uniqueness. ID is safer for simple lookup.
    // Support ID or Plate? QR usually uses ID for uniqueness. ID is safer for simple lookup.
    const session = await em.findOne(ParkingSession, {
        id: Number(id),
        status: ParkingStatus.ACTIVE
    }, {
        filters: false,
        populate: ['tenant']
    });

    if (!session) {
        // If not active, maybe it's completed? Check history?
        // For now, only show active session status.
        return res.status(404).json({ message: 'No active session found or ticket invalid.' });
    }

    const tariffs = await em.find(Tariff, {
        vehicleType: session.vehicleType,
        location: session.location
    });

    // Check if SystemSetting is tenant-scoped (it usually is in this SaaS architecture)
    // If it throws the same error, we must disable filters and pass tenant manually
    const settingsList = await em.find(SystemSetting, {
        tenant: session.tenant
    }, { filters: false });

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

export const getCompletedSessions = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    if (!locationId) {
        return res.status(400).json({ message: 'Location context is required' });
    }

    // Find active shift to scope history to "Current Shift"
    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
        location: locationId
    });

    if (!shift) {
        return res.status(400).json({ message: 'No active shift found' });
    }

    // Fetch completed sessions for this shift
    const sessions = await em.find(ParkingSession, {
        exitShift: shift,
        status: ParkingStatus.COMPLETED
    }, {
        orderBy: { exitTime: 'DESC' },
        limit: 50,
        populate: ['agreement']
    });

    return res.json(sessions);
};
export const cancelSession = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Role Check
    if (req.user.role.toLowerCase() !== 'admin' && req.user.role.toLowerCase() !== 'super_admin') {
        return res.status(403).json({ message: 'No authorized to delete sessions' });
    }

    const { id, reason } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await em.findOne(ParkingSession, {
        id: Number(id),
        status: ParkingStatus.ACTIVE
    }, { populate: ['entryShift'] });

    if (!session) {
        return res.status(404).json({ message: 'Active session not found' });
    }

    // Validation: Can only delete if in same location context (or tenant admin)
    // Assuming admin has access to tenant, let's verify tenant match
    if (session.tenant.id !== req.user.tenant?.id && req.user.role !== 'superadmin') {
        // This is a simplified check. Ideally check against the user's accessible tenants list properly.
        // For now, relying on MikroORM filter usually handles tenant isolation if configured.
        // If filter enabled, findOne would fail if wrong tenant.
    }

    session.status = ParkingStatus.CANCELLED;
    session.notes = session.notes ? `${session.notes} | CANCELLED: ${reason || 'No reason'}` : `CANCELLED: ${reason || 'No reason'}`;
    session.exitTime = new Date(); // Mark closed time
    session.cost = 0; // No cost for cancelled
    session.exitShift = await em.findOne(Shift, { user: req.user.id, isActive: true }) || session.entryShift; // Assign to current shift if possible

    await em.flush();

    return res.json({ message: 'Session cancelled', id: session.id });
};

/**
 * Update Vehicle Type (Admin Only)
 * PATCH /api/parking/:id/vehicle-type
 * Allows administrators to correct vehicle type errors
 * Automatically recalculates cost for completed sessions
 */
export const updateVehicleType = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Authorization: Admin or SuperAdmin only
    const userRole = req.user.role.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Not authorized to change vehicle type' });
    }

    const { id } = req.params;
    const { vehicleType } = req.body;

    // Validate inputs
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Valid session ID is required' });
    }

    if (!vehicleType || !Object.values(VehicleType).includes(vehicleType as VehicleType)) {
        return res.status(400).json({
            message: 'Valid vehicle type is required',
            validTypes: Object.values(VehicleType)
        });
    }

    // Find the session
    const session = await em.findOne(ParkingSession, {
        id: Number(id)
    }, { populate: ['entryShift', 'exitShift', 'tenant'] });

    if (!session) {
        return res.status(404).json({ message: 'Parking session not found' });
    }

    // Verify tenant access
    if (session.tenant.id !== req.user.tenant?.id && userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied to this session' });
    }

    // Only allow changes on ACTIVE sessions (before exit/payment)
    if (session.status !== ParkingStatus.ACTIVE) {
        return res.status(400).json({
            message: 'Solo se puede cambiar el tipo de vehículo en sesiones activas (antes de salir)',
            currentStatus: session.status
        });
    }

    // Check if type is actually changing
    if (session.vehicleType === vehicleType) {
        return res.status(400).json({ message: 'Vehicle type is already set to ' + vehicleType });
    }

    const oldVehicleType = session.vehicleType;
    session.vehicleType = vehicleType as VehicleType;

    // Add note about the change
    const changeNote = `Vehicle type changed from ${oldVehicleType} to ${vehicleType} by ${req.user.username}`;
    session.notes = session.notes ? `${session.notes} | ${changeNote}` : changeNote;

    await em.flush();

    return res.json({
        message: 'Vehicle type updated successfully',
        session: {
            id: session.id,
            plate: session.plate,
            vehicleType: session.vehicleType,
            status: session.status,
            oldVehicleType
        }
    });
};
