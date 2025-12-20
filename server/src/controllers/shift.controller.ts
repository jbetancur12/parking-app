import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';

export const openShift = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Check if user already has an active shift
    const existingShift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
    });

    if (existingShift) {
        return res.status(400).json({ message: 'User already has an active shift', shift: existingShift });
    }

    const { baseAmount } = req.body;

    const shift = em.create(Shift, {
        user: req.user.id,
        startTime: new Date(),
        baseAmount: baseAmount || 0,
        totalIncome: 0,
        totalExpenses: 0,
        declaredAmount: 0,
        isActive: true,
    });

    await em.persistAndFlush(shift);
    return res.status(201).json(shift);
};

export const getActiveShift = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
    });

    if (!shift) {
        return res.status(404).json({ message: 'No active shift found' });
    }

    return res.json(shift);
};

export const closeShift = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
    });

    if (!shift) {
        return res.status(404).json({ message: 'No active shift found' });
    }

    const { declaredAmount, notes } = req.body;

    // Logic to calculate totals (parking + transactions) would go here
    // For now, simple close
    shift.isActive = false;
    shift.endTime = new Date();
    shift.declaredAmount = declaredAmount || 0;
    shift.notes = notes;

    await em.flush();
    return res.json({ message: 'Shift closed successfully', shift });
};
