import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ParkingSession, ParkingStatus, VehicleType } from '../entities/ParkingSession';
import { Shift } from '../entities/Shift';
import { AuthRequest } from '../middleware/auth.middleware';

export const entryVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate, vehicleType, notes } = req.body;

    if (!plate || !vehicleType) {
        return res.status(400).json({ message: 'Plate and Vehicle Type are required' });
    }

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
        entryTime: new Date(),
        status: ParkingStatus.ACTIVE,
        entryShift: shift,
        notes,
    });

    await em.persistAndFlush(session);
    return res.status(201).json(session);
};

export const exitVehicle = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const { plate } = req.body;

    if (!plate) {
        return res.status(400).json({ message: 'Plate is required' });
    }

    // Find active shift
    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
    });

    if (!shift) {
        return res.status(400).json({ message: 'No active shift found. Open a shift first.' });
    }

    // Find active session
    const session = await em.findOne(ParkingSession, {
        plate,
        status: ParkingStatus.ACTIVE,
    });

    if (!session) {
        return res.status(404).json({ message: 'No active parking session found for this plate' });
    }

    // Calculate duration and cost (simplified logic for now)
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - session.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));

    // Dummy rate: $100 per minute
    const rate = 100;
    const cost = durationMinutes * rate;

    session.exitTime = exitTime;
    session.cost = cost;
    session.status = ParkingStatus.COMPLETED;
    session.exitShift = shift;

    // Update shift income? Ideally yes, but depends on payment flow.
    // We'll update shift.totalIncome later properly or via Transaction entity.
    // For now, let's create a Transaction.

    // Actually, let's keep it simple for this phase: Just close the session.

    await em.flush();
    return res.json({ session, cost, durationMinutes });
};

export const getActiveSessions = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const sessions = await em.find(ParkingSession, { status: ParkingStatus.ACTIVE }, { orderBy: { entryTime: 'DESC' } });
    return res.json(sessions);
};
