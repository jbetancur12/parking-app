import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Expense } from '../entities/Expense';
import { Shift } from '../entities/Shift';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';

export class ExpenseController {

    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager' });

            const { description, amount, shiftId } = req.body;
            const user = (req as any).user;

            if (!description || !amount || !shiftId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const shift = await em.findOne(Shift, { id: Number(shiftId) }, { populate: ['tenant', 'location'] });
            if (!shift) {
                return res.status(404).json({ message: 'Shift not found' });
            }

            if (!shift.isActive) {
                return res.status(400).json({ message: 'Shift is closed' });
            }

            // 1. Create Expense Record
            const expense = em.create(Expense, {
                description,
                amount: Number(amount),
                shift,
                tenant: shift.tenant,
                location: shift.location,
                createdAt: new Date()
            });

            // 2. Create Financial Transaction (Negative amount for cash flow?) 
            // Usually expenses reduce cash in hand.
            // In the legacy system, 'egresos' were just tracked. 
            // Here we treat it as an outflow.

            const transaction = em.create(Transaction, {
                shift,
                tenant: shift.tenant,
                location: shift.location,
                type: TransactionType.EXPENSE,
                paymentMethod: PaymentMethod.CASH,
                amount: -Number(amount), // Negative for expense
                description: `Egreso: ${description}`,
                timestamp: new Date()
            });

            em.persist([expense, transaction]);
            await em.flush();

            res.status(201).json(expense);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating expense' });
        }
    }

    async getAllByShift(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager' });

            const { shiftId } = req.params;
            const expenses = await em.find(Expense, { shift: Number(shiftId) }, { orderBy: { createdAt: 'DESC' } });

            res.json(expenses);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching expenses' });
        }
    }
}
