"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const core_1 = require("@mikro-orm/core");
const Shift_1 = require("../entities/Shift");
const Transaction_1 = require("../entities/Transaction");
const SystemSetting_1 = require("../entities/SystemSetting");
const date_fns_tz_1 = require("date-fns-tz");
class ReportController {
    // Get report for a specific shift
    async getShiftReport(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { shiftId } = req.params;
            const shift = await em.findOne(Shift_1.Shift, { id: Number(shiftId) }, { populate: ['user'] });
            if (!shift) {
                return res.status(404).json({ message: 'Shift not found' });
            }
            const transactions = await em.find(Transaction_1.Transaction, { shift: shift.id }, { orderBy: { timestamp: 'DESC' } });
            const totalIncome = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
            const vehicleCounts = transactions.reduce((acc, t) => {
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching shift report' });
        }
    }
    // Get daily stats
    async getDailyStats(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            // 1. Get Timezone from settings
            const timezoneSetting = await em.findOne(SystemSetting_1.SystemSetting, { key: 'app_timezone' });
            const timeZone = timezoneSetting?.value || 'America/Bogota';
            // 2. Parse Date Param (YYYY-MM-DD)
            const dateParam = req.query.date || new Date().toISOString().split('T')[0];
            // 3. Construct Start/End in Target Timezone
            // We want the range [dateParam 00:00:00 in TZ] to [dateParam 23:59:59.999 in TZ]
            // converted to UTC for database comparison (assuming DB stores UTC or compatible timestamps)
            // Create a string that represents the start of the day in the target timezone
            const startString = `${dateParam} 00:00:00`;
            const endString = `${dateParam} 23:59:59.999`;
            const startDate = (0, date_fns_tz_1.fromZonedTime)(startString, timeZone);
            const endDate = (0, date_fns_tz_1.fromZonedTime)(endString, timeZone);
            console.log('--- DAILY STATS DEBUG ---');
            console.log('TZ Setting:', timeZone);
            console.log('Date Param:', dateParam);
            console.log('Start String (Local):', startString);
            console.log('Start Date (UTC):', startDate.toISOString());
            console.log('End Date (UTC):', endDate.toISOString());
            console.log('-------------------------');
            // Find transactions between these dates
            const transactions = await em.find(Transaction_1.Transaction, {
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
                }
                else {
                    stats.totalIncome += amount;
                    if (t.type === 'PARKING_REVENUE') {
                        if (t.description.includes('[DAY]')) {
                            stats.parkingDaily += amount;
                        }
                        else {
                            // Default or explicit HOUR
                            stats.parkingHourly += amount;
                        }
                    }
                    else if (t.type === 'MONTHLY_PAYMENT') {
                        stats.monthlyIncome += amount;
                    }
                    else if (t.type === 'WASH_SERVICE') {
                        stats.washIncome += amount;
                    }
                    else if (t.type === 'INCOME') {
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching daily stats' });
        }
    }
}
exports.ReportController = ReportController;
