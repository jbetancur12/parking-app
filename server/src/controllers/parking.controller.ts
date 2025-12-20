import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ParkingSession, ParkingStatus, VehicleType, PlanType } from '../entities/ParkingSession';
import { Shift } from '../entities/Shift';
import { Tariff, TariffType } from '../entities/Tariff';
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
        ...result
    });
};

export const exitVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate, paymentMethod } = req.body;

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

    const { cost, durationMinutes, exitTime } = calculateParkingCost(session, tariffs, gracePeriod);

    session.exitTime = exitTime;
    session.cost = cost;
    session.status = ParkingStatus.COMPLETED;
    session.exitShift = shift;

    // Create Revenue Transaction
    const transaction = em.create(Transaction, {
        shift: shift,
        type: TransactionType.PARKING_REVENUE,
        description: `Parking[${session.planType}]: ${session.plate} (${Math.floor(durationMinutes)} mins)`,
        amount: cost,
        paymentMethod: paymentMethod || PaymentMethod.CASH, // Default to CASH if not provided
        timestamp: new Date()
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
        cost,
        durationMinutes
    });
};

export const getActiveSessions = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const sessions = await em.find(ParkingSession, { status: ParkingStatus.ACTIVE }, { orderBy: { entryTime: 'DESC' } });
    return res.json(sessions);
};
