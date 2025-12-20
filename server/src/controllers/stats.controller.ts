import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Transaction, TransactionType } from '../entities/Transaction';
import { Shift } from '../entities/Shift';
import { Tariff, VehicleType } from '../entities/Tariff';
import { User, UserRole } from '../entities/User';

export const getDashboardStats = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    try {
        // 1. Weekly Income (Last 7 days)
        const weeklyIncome = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

            const startOfDay = new Date(dateStr);
            const endOfDay = new Date(dateStr);
            endOfDay.setHours(23, 59, 59, 999);

            const transactions = await em.find(Transaction, {
                timestamp: { $gte: startOfDay, $lte: endOfDay },
                type: { $in: [TransactionType.PARKING_REVENUE, TransactionType.MONTHLY_PAYMENT, TransactionType.WASH_SERVICE] }
            });

            const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            weeklyIncome.push({ name: displayDate, amount: total });
        }

        // 2. Current Occupancy (from active parking sessions - needs Shift check or calculation)
        // Since we don't have a direct "active sessions" count in DB without querying open transactions,
        // we can estimate or query active shifts if we had that logic.
        // For now, let's assume we can fetch active sessions via a helper or direct logic if Session entity existed.
        // Wait, we don't have a "Session" entity, we use "ParkingSession" logic usually as local state or active transactions?
        // Ah, we use `Transaction` for closed sessions. Open sessions are likely in memory or inferred?
        // Let's check ParkingPage. It fetches `/api/parking/sessions`. Let's assume we can call something similar.
        // But for dashboard we need counts.
        // Let's skip live occupancy for now or implement "Transactions Today"

        // Alternative: Transactions by Type (Last 30 days)
        const startOfMonth = new Date();
        startOfMonth.setDate(startOfMonth.getDate() - 30);

        // MikroORM find count by group requires knex or raw query usually, 
        // or fetching all and grouping in JS (easier for small datasets).
        // Let's use JS grouping since traffic is manageable for now.
        const monthTransactions = await em.find(Transaction, {
            timestamp: { $gte: startOfMonth }
        });

        const typeStats: Record<string, number> = {};
        monthTransactions.forEach(t => {
            const type = t.type;
            typeStats[type] = (typeStats[type] || 0) + 1;
        });

        const typeMapping: Record<string, string> = {
            [TransactionType.PARKING_REVENUE]: 'Parqueo',
            [TransactionType.MONTHLY_PAYMENT]: 'Mensualidad',
            [TransactionType.WASH_SERVICE]: 'Lavadero',
            [TransactionType.EXPENSE]: 'Gastos'
        };

        const pieData = Object.entries(typeStats).map(([type, count]) => ({
            name: typeMapping[type] || type,
            value: count
        })).filter(s => s.name !== 'Gastos'); // Filter out expenses for income focus

        // 3. Peak Hours (Entry times)
        // This is complex without "Entry Time" stored separately in Transaction (Transaction is usually exit/payment).
        // If Transaction timestamp is exit time, it shows when people LEAVE.
        // Let's use Transaction timestamp as "Activity Hour".

        const hourStats = await em.getConnection().execute(`
            SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as count
            FROM transaction
            WHERE timestamp >= NOW() - INTERVAL '30 days'
            AND type = '${TransactionType.PARKING_REVENUE}'
            GROUP BY hour
            ORDER BY hour ASC
        `);

        // Format for Recharts
        const hourlyData = Array.from({ length: 24 }, (_, i) => {
            const found = hourStats.find((h: any) => Number(h.hour) === i);
            return {
                hour: `${i}:00`,
                count: found ? Number(found.count) : 0
            };
        });

        res.json({
            weeklyIncome,
            pieData,
            hourlyData
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};
