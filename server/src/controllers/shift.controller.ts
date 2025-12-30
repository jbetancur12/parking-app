import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { AuthRequest } from '../middleware/auth.middleware';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { AuditService } from '../services/AuditService';

export const openShift = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Check if user already has an active shift IN THIS LOCATION
    // If we want to strictly limit 1 shift per user globally, we keep it as is.
    // But user wants multiple shifts per location.

    const { baseAmount, locationId } = req.body;

    if (!locationId) {
        return res.status(400).json({ message: 'Location ID is required' });
    }

    const existingShift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
        location: locationId
    });

    if (existingShift) {
        return res.status(400).json({ message: 'User already has an active shift in this location', shift: existingShift });
    }

    const authReq = req as any;
    const currentTenant = authReq.tenant;

    if (!currentTenant) {
        return res.status(403).json({ message: 'Tenant context required' });
    }

    const shift = em.create(Shift, {
        user: req.user.id,
        tenant: currentTenant.id,
        location: locationId,
        startTime: new Date(),
        baseAmount: baseAmount || 0,
        totalIncome: 0,
        totalExpenses: 0,
        cashIncome: 0,
        transferIncome: 0,
        declaredAmount: 0,
        isActive: true,
    } as any);

    await em.persistAndFlush(shift);
    return res.status(201).json(shift);
};

export const getActiveShift = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    console.log(`[getActiveShift] Checking for user ${req.user.id} at location ${locationId}`);

    if (!locationId) {
        console.warn(`[getActiveShift] Missing location ID`);
        return res.status(400).json({ message: 'Valid Location context required' });
    }

    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
        location: locationId
    });

    if (!shift) {
        // console.log(`[getActiveShift] No active shift found for user ${req.user.id} at location ${locationId}`);
        return res.status(404).json({ message: 'No active shift found' });
    }

    // console.log(`[getActiveShift] Found shift ${shift.id}`);
    return res.json(shift);
};

export const closeShift = async (req: AuthRequest, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    if (!locationId) {
        return res.status(400).json({ message: 'Location context required' });
    }

    const shift = await em.findOne(Shift, {
        user: req.user.id,
        isActive: true,
        location: locationId
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
    shift.cashIncome = cashIncome;
    shift.transferIncome = transferIncome;
    shift.isActive = false;
    shift.endTime = new Date();
    shift.declaredAmount = declaredAmount || 0;
    shift.notes = notes;

    await em.flush();

    await AuditService.log(em, 'SHIFT_CLOSE', 'Shift', shift.id.toString(), req.user!, {
        declaredAmount,
        totalIncome,
        cashIncome,
        transferIncome,
        totalExpenses,
        difference: shift.declaredAmount - (shift.baseAmount + cashIncome - totalExpenses)
    }, req);

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
            // Use stored cashIncome if available (new records), otherwise fallback or assume all is cash
            // For backward compatibility, if cashIncome is 0 and transferIncome is 0 but totalIncome > 0,
            // we might assume it was all cash (old logic) or leave it. 
            // Better to rely on the fact we just added columns so old ones are 0.
            // But old `shift.totalIncome` was calculated.
            // Re-calculating correctly:
            const effectiveCashIncome = shift.cashIncome || (shift.totalIncome - (shift.transferIncome || 0));

            const expectedCash = shift.baseAmount + effectiveCashIncome - shift.totalExpenses;
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
                cashIncome: shift.cashIncome,
                transferIncome: shift.transferIncome,
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
