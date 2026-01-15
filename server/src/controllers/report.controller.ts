import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Shift } from '../entities/Shift';
import { Transaction } from '../entities/Transaction';
import { SystemSetting } from '../entities/SystemSetting';
import { fromZonedTime } from 'date-fns-tz';
import { logger } from '../utils/logger';

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
            logger.error({ error }, 'Error fetching shift report');
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

            logger.debug({ timeZone }, '[Report Debug] Zone');
            logger.debug({ startString, endString }, '[Report Debug] Input');
            logger.debug({ utcStart: startDate.toISOString(), utcEnd: endDate.toISOString() }, '[Report Debug] UTC Range');

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
            logger.error({ error }, 'Error fetching daily stats');
            res.status(500).json({ message: 'Error fetching daily stats' });
        }
    }

    // Get consolidated report across all locations of a tenant
    async getConsolidatedReport(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            // Get tenant from context (set by saasContext middleware)
            const tenant = (req as any).tenant;
            if (!tenant) {
                return res.status(400).json({ message: 'Tenant context required' });
            }

            // 1. Get Timezone from settings
            const timezoneSetting = await em.findOne(SystemSetting, { key: 'app_timezone' });
            const timeZone = timezoneSetting?.value || 'America/Bogota';

            // 2. Parse Date Params
            const dateParam = req.query.date as string;
            const dateFrom = req.query.dateFrom as string;
            const dateTo = req.query.dateTo as string;

            let startString: string;
            let endString: string;

            if (dateFrom && dateTo) {
                startString = `${dateFrom} 00:00:00`;
                endString = `${dateTo} 23:59:59.999`;
            } else {
                const targetDate = dateParam || new Date().toISOString().split('T')[0];
                startString = `${targetDate} 00:00:00`;
                endString = `${targetDate} 23:59:59.999`;
            }

            const startDate = fromZonedTime(startString, timeZone);
            const endDate = fromZonedTime(endString, timeZone);

            // 3. Get all locations for this tenant
            const locations = await em.find('Location' as any, { tenant: tenant.id });

            // 4. Fetch transactions WITHOUT location filter (consolidated view)
            // We temporarily disable the location filter to get all tenant's data
            const originalFilters = em.getFilterParams('location');
            em.setFilterParams('location', {}); // Disable location filter

            const transactions = await em.find(Transaction, {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }, {
                populate: ['location'],
                orderBy: { timestamp: 'DESC' }
            });

            // Restore filters
            em.setFilterParams('location', originalFilters.location || {});

            // 5. Aggregate by location
            const locationStats: any = {};
            const globalStats = {
                totalIncome: 0,
                totalExpenses: 0,
                parkingHourly: 0,
                parkingDaily: 0,
                monthlyIncome: 0,
                washIncome: 0,
                otherIncome: 0
            };

            locations.forEach((loc: any) => {
                locationStats[loc.id] = {
                    locationId: loc.id,
                    locationName: loc.name,
                    totalIncome: 0,
                    totalExpenses: 0,
                    parkingHourly: 0,
                    parkingDaily: 0,
                    monthlyIncome: 0,
                    washIncome: 0,
                    otherIncome: 0,
                    transactionCount: 0
                };
            });

            transactions.forEach(t => {
                const amount = Number(t.amount);
                const locId = (t as any).location?.id;

                // Update location-specific stats

                // Update location-specific stats
                if (locId && locationStats[locId]) {
                    locationStats[locId].transactionCount++;

                    if (t.type === 'EXPENSE') {
                        locationStats[locId].totalExpenses += amount;
                    } else {
                        locationStats[locId].totalIncome += amount;

                        if (t.type === 'PARKING_REVENUE') {
                            if (t.description.includes('[DAY]')) {
                                locationStats[locId].parkingDaily += amount;
                            } else {
                                locationStats[locId].parkingHourly += amount;
                            }
                        } else if (t.type === 'MONTHLY_PAYMENT') {
                            locationStats[locId].monthlyIncome += amount;
                        } else if (t.type === 'WASH_SERVICE') {
                            locationStats[locId].washIncome += amount;
                        } else if (t.type === 'INCOME') {
                            locationStats[locId].otherIncome += amount;
                        }
                    }
                }

                // Update global stats
                if (t.type === 'EXPENSE') {
                    globalStats.totalExpenses += amount;
                } else {
                    globalStats.totalIncome += amount;

                    if (t.type === 'PARKING_REVENUE') {
                        if (t.description.includes('[DAY]')) {
                            globalStats.parkingDaily += amount;
                        } else {
                            globalStats.parkingHourly += amount;
                        }
                    } else if (t.type === 'MONTHLY_PAYMENT') {
                        globalStats.monthlyIncome += amount;
                    } else if (t.type === 'WASH_SERVICE') {
                        globalStats.washIncome += amount;
                    } else if (t.type === 'INCOME') {
                        globalStats.otherIncome += amount;
                    }
                }
            });

            res.json({
                tenant: {
                    id: tenant.id,
                    name: tenant.name
                },
                date: dateParam || (dateFrom ? `${dateFrom} to ${dateTo}` : 'Unknown'),
                timezone: timeZone,
                globalStats: {
                    ...globalStats,
                    transactionCount: transactions.length,
                    locationCount: locations.length
                },
                locationStats: Object.values(locationStats),
                debug: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                }
            });

        } catch (error) {
            logger.error({ error }, 'Error fetching consolidated report:');
            res.status(500).json({ message: 'Error fetching consolidated report' });
        }
    }
}
