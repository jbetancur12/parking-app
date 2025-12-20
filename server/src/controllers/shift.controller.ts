import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { AuthRequest } from '../middleware/auth.middleware';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';

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

    // Calculate totals from transactions
    const transactions = await em.find(Transaction, { shift: shift.id });

    let totalIncome = 0;
    let totalExpenses = 0;
    let cashIncome = 0;
    let transferIncome = 0;

    transactions.forEach(t => {
        if (t.type === TransactionType.EXPENSE) {
            totalExpenses += Math.abs(t.amount);
        } else {
            totalIncome += t.amount;
            // Separate by payment method
            if (t.paymentMethod === PaymentMethod.CASH) {
                cashIncome += t.amount;
            } else if (t.paymentMethod === PaymentMethod.TRANSFER) {
                transferIncome += t.amount;
            } else {
                // For old transactions without payment method, count as cash
                cashIncome += t.amount;
            }
        }
    });

    shift.totalIncome = totalIncome;
    shift.totalExpenses = totalExpenses;
    shift.isActive = false;
    shift.endTime = new Date();
    shift.declaredAmount = declaredAmount || 0;
    shift.notes = notes;

    await em.flush();

    // Return summary
    const expectedCash = shift.baseAmount + cashIncome - totalExpenses; // Only cash income counts for expected cash
    const difference = shift.declaredAmount - expectedCash;

    return res.json({
        message: 'Shift closed successfully',
        shift,
        summary: {
            baseAmount: shift.baseAmount,
            totalIncome,
            cashIncome,
            transferIncome,
            totalExpenses,
            expectedCash,
            declaredAmount: shift.declaredAmount,
            difference,
            transactionCount: transactions.length
        }
    });
};

export const getAllClosed = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    try {
        const closedShifts = await em.find(Shift,
            { isActive: false },
            {
                populate: ['user'],
                orderBy: { endTime: 'DESC' }
            }
        );

        // Calculate summary for each shift
        const shiftsWithSummary = closedShifts.map(shift => {
            const expectedCash = shift.baseAmount + shift.totalIncome - shift.totalExpenses;
            const difference = shift.declaredAmount - expectedCash;

            return {
                id: shift.id,
                user: {
                    id: shift.user.id,
                    username: shift.user.username
                },
                startTime: shift.startTime,
                endTime: shift.endTime,
                baseAmount: shift.baseAmount,
                totalIncome: shift.totalIncome,
                totalExpenses: shift.totalExpenses,
                declaredAmount: shift.declaredAmount,
                expectedCash,
                difference,
                notes: shift.notes
            };
        });

        res.json(shiftsWithSummary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching closed shifts' });
    }
};
