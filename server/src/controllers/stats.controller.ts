import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { ParkingSession, ParkingStatus, VehicleType } from '../entities/ParkingSession';
import { SystemSetting } from '../entities/SystemSetting';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export const getPeakHours = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    // Calculate peak hours based on active sessions or transactions entry time
    // For simplicity, let's analyze last 30 days of transactions (type PARKING_REVENUE)
    const thirtyDaysAgo = subDays(new Date(), 30);

    const transactions = await em.find(Transaction, {
        type: TransactionType.PARKING_REVENUE,
        timestamp: { $gte: thirtyDaysAgo }
    });

    // Initialize 0-23 counters
    const hoursDistribution = Array(24).fill(0);

    transactions.forEach(t => {
        const hour = new Date(t.timestamp).getHours();
        hoursDistribution[hour]++;
    });

    const hourlyData = hoursDistribution.map((count, hour) => ({
        hour: `${hour}:00`,
        count
    }));

    return res.json(hourlyData);
};

export const getWeeklyOccupancy = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    // Analyze last 7 days revenue count as proxy for occupancy
    const settings = await em.findOne(SystemSetting, { key: 'app_timezone' });
    // const timeZone = settings?.value || 'America/Bogota'; 

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
            date: d,
            label: format(d, 'EEE dd') // e.g. Mon 21
        };
    });

    const stats = await Promise.all(last7Days.map(async (day) => {
        const start = startOfDay(day.date);
        const end = endOfDay(day.date);

        const count = await em.count(Transaction, {
            type: TransactionType.PARKING_REVENUE,
            timestamp: { $gte: start, $lte: end }
        });

        // Also calculate daily income
        const transactions = await em.find(Transaction, {
            type: TransactionType.PARKING_REVENUE,
            timestamp: { $gte: start, $lte: end }
        });

        const income = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            name: day.label,
            veiculos: count,
            income
        };
    }));

    // Transform for separate charts
    const weeklyIncome = stats.map(s => ({ name: s.name, amount: s.income }));
    const weeklyTraffic = stats.map(s => ({ name: s.name, count: s.veiculos }));

    return res.json({ weeklyIncome, weeklyTraffic });
};


export const getDashboardStats = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    // Reuse logic or call internal functions
    // 1. Hourly Data (Peak Hours)
    // 2. Weekly Income
    // 3. Pie Chart (Cash vs Transfer)

    const thirtyDaysAgo = subDays(new Date(), 30);
    const transactions = await em.find(Transaction, {
        type: TransactionType.PARKING_REVENUE,
        timestamp: { $gte: thirtyDaysAgo }
    });

    // Hourly
    const hoursDistribution = Array(24).fill(0);
    transactions.forEach(t => {
        const hour = new Date(t.timestamp).getHours();
        hoursDistribution[hour]++;
    });
    const hourlyData = hoursDistribution.map((count, hour) => ({
        hour: `${hour}:00`,
        count
    }));

    // Weekly Income (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
            date: d,
            label: format(d, 'EEE dd')
        };
    });

    const weeklyIncome = await Promise.all(last7Days.map(async (day) => {
        const start = startOfDay(day.date);
        const end = endOfDay(day.date);
        const txs = transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
        const income = txs.reduce((sum, t) => sum + Number(t.amount), 0);
        return { name: day.label, amount: income };
    }));

    // Payment Method Distribution
    let cashTotal = 0;
    let transferTotal = 0;

    transactions.forEach(t => {
        if (t.paymentMethod === PaymentMethod.TRANSFER) transferTotal += Number(t.amount);
        else cashTotal += Number(t.amount);
    });

    const pieData = [
        { name: 'Efectivo', value: cashTotal },
        { name: 'Transferencia', value: transferTotal }
    ];

    return res.json({
        hourlyData,
        weeklyIncome,
        pieData
    });
};

export const getOccupancy = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    const locationIdRaw = req.headers['x-location-id'];
    const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

    // Filter by location if present
    const filter: any = { status: ParkingStatus.ACTIVE };
    if (locationId && locationId !== 'null' && locationId !== 'undefined') {
        filter.location = locationId;
    }

    const sessions = await em.find(ParkingSession, filter);

    let carCount = 0;
    let motoCount = 0;

    sessions.forEach(s => {
        if (s.vehicleType === VehicleType.CAR) carCount++;
        else if (s.vehicleType === VehicleType.MOTORCYCLE) motoCount++;
    });

    // Get Capacities (System Global defaults)
    const settingsList = await em.find(SystemSetting, {});
    const settings: Record<string, string> = {};
    settingsList.forEach(s => settings[s.key] = s.value);

    // If we want per-location capacity, we should fetch Location here.
    // For now, use global fallback.
    const carCapacity = Number(settings['capacity_car'] || 50);
    const motoCapacity = Number(settings['capacity_motorcycle'] || 30);
    const checkEnabled = settings['check_capacity'] === 'true';

    return res.json({
        car: {
            current: carCount,
            capacity: carCapacity
        },
        motorcycle: {
            current: motoCount,
            capacity: motoCapacity
        },
        checkEnabled
    });
};
