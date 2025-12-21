import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { Transaction } from '../entities/Transaction';
import { SystemSetting } from '../entities/SystemSetting';
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
            const timeZone = timezoneSetting?.value || 'America/Bogota'; // Default to Colombia

            // 2. Parse Date Params
            const dateParam = req.query.date as string;
            const dateFrom = req.query.dateFrom as string;
            const dateTo = req.query.dateTo as string;

            let startString: string;
            let endString: string;

            if (dateFrom && dateTo) {
                // Range Mode
                startString = `${dateFrom} 00:00:00`;
                endString = `${dateTo} 23:59:59.999`;
            } else {
                // Single Date Mode (default to today if missing)
                const targetDate = dateParam || new Date().toISOString().split('T')[0];
                startString = `${targetDate} 00:00:00`;
                endString = `${targetDate} 23:59:59.999`;
            }

            // 3. Construct Start/End in Target Timezone
            // fromZonedTime takes a "Local" string (e.g. 2023-10-25 00:00:00) and the timezone
            // and returns the UTC Date instant that corresponds to that local time.
            const startDate = fromZonedTime(startString, timeZone);
            const endDate = fromZonedTime(endString, timeZone);

            console.log(`[Report Debug] Zone: ${timeZone}`);
            console.log(`[Report Debug] Input: ${startString} to ${endString}`);
            console.log(`[Report Debug] UTC: ${startDate.toISOString()} to ${endDate.toISOString()}`);

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
                date: dateParam || (dateFrom ? `${dateFrom} to ${dateTo}` : 'Unknown'),
                timezone: timeZone,
                debug: {
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
