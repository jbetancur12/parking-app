import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { Shift } from '../entities/Shift';

export class SaleController {

    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { description, amount, paymentMethod } = req.body;
            const user = (req as any).user;
            const numericAmount = Number(amount);

            if (!description || !numericAmount || numericAmount <= 0) {
                return res.status(400).json({ message: 'Invalid description or amount' });
            }

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            // Find active shift for user in this location (if possible)
            // Or just active shift for user. 
            // Better to include location for safety.
            const filter: any = {
                user: user.id,
                isActive: true // active shift
            };
            if (locationId) {
                filter.location = locationId;
            }

            const activeShift = await em.findOne(Shift, filter, { populate: ['tenant', 'location'] });

            if (!activeShift) {
                return res.status(400).json({ message: 'No active shift found. Please start a shift first.' });
            }

            const transaction = em.create(Transaction, {
                shift: activeShift,
                tenant: activeShift.tenant,
                location: activeShift.location,
                type: TransactionType.INCOME,
                paymentMethod: paymentMethod || PaymentMethod.CASH,
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

    async getAllByShift(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { shiftId } = req.params;
            const transactions = await em.find(Transaction, {
                shift: Number(shiftId),
                type: TransactionType.INCOME
            }, { orderBy: { timestamp: 'DESC' } });

            res.json(transactions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching sales' });
        }
    }
}
