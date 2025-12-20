import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { Transaction } from '../entities/Transaction';

export class ReportController {

    // Get report for a specific shift
    async getShiftReport(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const { shiftId } = req.params;
            const shift = await em.findOne(Shift, { id: Number(shiftId) }, { populate: ['user'] });

            if (!shift) {
                return res.status(404).json({ message: 'Shift not found' });
            }

            const transactions = await em.find(Transaction, { shift: shift.id }, { orderBy: { timestamp: 'DESC' } });

            const totalIncome = transactions.reduce((acc: number, t: Transaction) => acc + Number(t.amount), 0);

            const vehicleCounts = transactions.reduce((acc: any, t: Transaction) => {
                // Just a simple heuristic for now, assuming description contains vehicle type or added via metadata later
                //Ideally Transaction should link to ParkingSession for better stats, but descriptions work for simple totals
                return acc;
            }, {});

            res.json({
                shift,
                transactions,
                summary: {
                    totalIncome,
                    transactionCount: transactions.length,
                    cashInHand: Number(shift.baseAmount) + totalIncome
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching shift report' });
        }
    }

    // Get daily stats
    async getDailyStats(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const dateParam = req.query.date as string || new Date().toISOString().split('T')[0];
            const startOfDay = new Date(dateParam);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(dateParam);
            endOfDay.setHours(23, 59, 59, 999);

            // Find transactions between these dates
            const transactions = await em.find(Transaction, {
                timestamp: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }, {
                orderBy: { timestamp: 'DESC' }
            });

            const totalIncome = transactions.reduce((acc, t) => acc + Number(t.amount), 0);

            res.json({
                date: dateParam,
                totalIncome,
                transactionCount: transactions.length,
                transactions
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching daily stats' });
        }
    }
}
