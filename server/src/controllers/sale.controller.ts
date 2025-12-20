import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Transaction, TransactionType } from '../entities/Transaction';
import { Shift } from '../entities/Shift';

export class SaleController {

    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { description, amount } = req.body;
            const numericAmount = Number(amount);

            if (!description || !numericAmount || numericAmount <= 0) {
                return res.status(400).json({ message: 'Invalid description or amount' });
            }

            // Find active shift
            const activeShift = await em.findOne(Shift, { endTime: null });
            if (!activeShift) {
                return res.status(400).json({ message: 'No active shift found. Please start a shift first.' });
            }

            const transaction = em.create(Transaction, {
                shift: activeShift,
                type: TransactionType.INCOME,
                description: description,
                amount: numericAmount,
                timestamp: new Date()
            });

            await em.persistAndFlush(transaction);
            res.status(201).json(transaction);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error registering sale' });
        }
    }
}
