
import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ParkingSession, ParkingStatus, VehicleType, PlanType } from '../entities/ParkingSession';
import { Shift } from '../entities/Shift';
import { Tariff, TariffType, PricingModel } from '../entities/Tariff';
import { Agreement, AgreementType } from '../entities/Agreement';
import { SystemSetting } from '../entities/SystemSetting';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { AuthRequest } from '../middleware/auth.middleware';
import { Loyalty } from '../entities/Loyalty';
import { MonthlyClient } from '../entities/MonthlyClient';
import { cacheService } from '../services/CacheService';

const calculateParkingCost = (session: ParkingSession, tariffs: Tariff[], gracePeriod: number) => {
    // We now expect 'tariffs' to potentially contain a single configuration per vehicle type,
    // OR distinct rows. With the new model, we likely look for a Tariff record that defines the rules.
    // For backward compatibility or mixed usage, we'll try to find a relevant Tariff record.
    // In the new UI, we save ONE Tariff record per VehicleType with the specific fields.

    // Find the tariff configuration for this vehicle type
    const tariffConfig = tariffs.find(t => t.vehicleType === session.vehicleType);
    // Fallback: if multiple (old style), we might need to rely on old logic. 
    // But let's assume the new UI saves a unified config.

    const exitTime = new Date();
    const durationMs = exitTime.getTime() - session.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    let cost = 0;

    if (!tariffConfig) {
        // Fallback or Error
        return { cost: 0, durationMinutes, exitTime };
    }

    if (session.planType === PlanType.DAY) {
        // Explicit Day plan override? 
        // Or just use dayMaxPrice? Usually 'PlanType.DAY' implies a flat fee?
        // Let's stick to the 'DAY' tariff type if it exists in the old way, OR use dayMaxPrice?
        // User requested: "Tarifa Plena (Día Único)" option in UI.
        // If user Selected "Dia Unico" (PlanType.DAY), we charge the Day Rate.
        // Where is the Day Rate stored now? 
        // In 'dayMaxPrice' or 'basePrice' of a TariffType.DAY?
        // Let's assume for PlanType.DAY we look for a specific Day Tariff or use dayMaxPrice.
        const dayTariff = tariffs.find(t => t.tariffType === TariffType.DAY);
        cost = dayTariff ? Number(dayTariff.cost) : (tariffConfig.dayMaxPrice || 15000);

        // Multi-day logic
        const days = Math.ceil(durationMinutes / 1440);
        cost = days * cost;

    } else {
        // Normal Calculation (Minute or Blocks) based on Configuration
        if (tariffConfig.pricingModel === PricingModel.MINUTE) {
            // Bogotá Style: Minute * Price
            // Price is likely in 'basePrice' (per minute) or 'cost'.
            const pricePerMinute = Number(tariffConfig.basePrice || tariffConfig.cost || 0);
            cost = durationMinutes * pricePerMinute;
        } else if (tariffConfig.pricingModel === PricingModel.BLOCKS) {
            // Shopping Center Style: First Block (Hour) + Fractions
            if (durationMinutes <= tariffConfig.baseTimeMinutes) {
                cost = Number(tariffConfig.basePrice);
            } else {
                const extraMinutes = durationMinutes - tariffConfig.baseTimeMinutes;
                // Let's us simple block math first:
                const extraBlocks = Math.ceil(extraMinutes / tariffConfig.extraFracTimeMinutes);
                cost = Number(tariffConfig.basePrice) + (extraBlocks * Number(tariffConfig.extraFracPrice));
            }
        }

        // Apply Day Max Price limit (Tope Diario)
        if (tariffConfig.dayMaxPrice && cost > Number(tariffConfig.dayMaxPrice)) {
            cost = Number(tariffConfig.dayMaxPrice);
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
        return res.status(400).json({ message: 'Vehicle already has an active session in this location' });
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

    const session = em.create(ParkingSession, {
        plate,
        vehicleType: vehicleType as VehicleType,
        planType: selectedPlan,
        entryTime: entryTime ? new Date(entryTime) : new Date(),
        status: ParkingStatus.ACTIVE,
        entryShift: shift,
        tenant: shift.tenant,
        location: shift.location,
        notes,
    } as any);

    await em.persistAndFlush(session);
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
    const tariffs = await em.find(Tariff, { vehicleType: session.vehicleType });
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
        tariffs = await em.find(Tariff, { vehicleType: session.vehicleType, tenant: shift.tenant });
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
        tenant: shift.tenant,
        location: shift.location,
        type: TransactionType.PARKING_REVENUE,
        description: `Parking[${session.planType}]: ${session.plate} (${Math.floor(durationMinutes)} mins)${appliedDiscount > 0 ? ` - DESC: $${appliedDiscount} (${finalDiscountReason})` : ''} `,
        amount: finalCost,
        paymentMethod: paymentMethod || PaymentMethod.CASH,
        timestamp: new Date(),
        discount: appliedDiscount > 0 ? appliedDiscount : undefined,
        discountReason: finalDiscountReason,
        agreement: appliedAgreement
    } as any);
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
        tenant: session.tenant
    }, { filters: false });

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
