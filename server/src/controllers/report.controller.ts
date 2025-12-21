import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { Transaction } from '../entities/Transaction';
import { SystemSetting } from '../entities/SystemSetting';
import { startOfDay, endOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

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

            // 1. Get Timezone from settings
            const timezoneSetting = await em.findOne(SystemSetting, { key: 'app_timezone' });
            const timeZone = timezoneSetting?.value || 'America/Bogota';

            // 2. Parse Date Param (YYYY-MM-DD)
            const dateParam = req.query.date as string || new Date().toISOString().split('T')[0];

            // 3. Construct Start/End in Target Timezone
            // We want the range [dateParam 00:00:00 in TZ] to [dateParam 23:59:59.999 in TZ]
            // converted to UTC for database comparison (assuming DB stores UTC or compatible timestamps)

            // Create a string that represents the start of the day in the target timezone
            const startString = `${dateParam} 00:00:00`;
            const endString = `${dateParam} 23:59:59.999`;

            const startDate = fromZonedTime(startString, timeZone);
            const endDate = fromZonedTime(endString, timeZone);



            // Find transactions between these dates
            const transactions = await em.find(Transaction, {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }, {
                orderBy: { timestamp: 'DESC' }
            });

            const stats = {
                totalIncome: 0,
                totalExpenses: 0,
                parkingHourly: 0,
                parkingDaily: 0,
                monthlyIncome: 0,
                washIncome: 0,
                otherIncome: 0
            };

            transactions.forEach(t => {
                const amount = Number(t.amount);
                if (t.type === 'EXPENSE') {
                    stats.totalExpenses += amount;
                } else {
                    stats.totalIncome += amount;

                    if (t.type === 'PARKING_REVENUE') {
                        if (t.description.includes('[DAY]')) {
                            stats.parkingDaily += amount;
                        } else {
                            // Default or explicit HOUR
                            stats.parkingHourly += amount;
                        }
                    } else if (t.type === 'MONTHLY_PAYMENT') {
                        stats.monthlyIncome += amount;
                    } else if (t.type === 'WASH_SERVICE') {
                        stats.washIncome += amount;
                    } else if (t.type === 'INCOME') {
                        stats.otherIncome += amount;
                    }
                }
            });

            res.json({
                date: dateParam,
                timezone: timeZone,
                range: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                },
                ...stats,
                transactionCount: transactions.length,
                transactions
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching daily stats' });
        }
    }
}
