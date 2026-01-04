import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { ParkingSession, ParkingStatus, VehicleType } from '../entities/ParkingSession';
import { SystemSetting } from '../entities/SystemSetting';
import { subDays, startOfDay, endOfDay, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tenant, TenantStatus } from '../entities/Tenant';
import { Location } from '../entities/Location';
import { User } from '../entities/User';

export const getPeakHours = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    // Calculate peak hours based on active sessions or transactions entry time
    // For simplicity, let's analyze last 30 days of transactions (type PARKING_REVENUE)
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Use ParkingSession to differentiate Vehicle Types
    const sessions = await em.find(ParkingSession, {
        status: ParkingStatus.COMPLETED,
        exitTime: { $gte: thirtyDaysAgo }
    });

    // Initialize 0-23 counters
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        car: 0,
        motorcycle: 0,
        total: 0
    }));

    sessions.forEach(s => {
        if (!s.exitTime) return;
        const hour = new Date(s.exitTime).getHours();

        if (s.vehicleType === VehicleType.CAR) hourlyData[hour].car++;
        else if (s.vehicleType === VehicleType.MOTORCYCLE) hourlyData[hour].motorcycle++;

        hourlyData[hour].total++;
    });

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
            label: format(d, 'EEE dd', { locale: es }) // e.g. lun 21
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
    // Hourly (Peak Hours) with Vehicle Split
    const sessions = await em.find(ParkingSession, {
        status: ParkingStatus.COMPLETED,
        exitTime: { $gte: thirtyDaysAgo }
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        car: 0,
        motorcycle: 0
    }));

    sessions.forEach(s => {
        if (!s.exitTime) return;
        const hour = new Date(s.exitTime).getHours();
        if (s.vehicleType === VehicleType.CAR) hourlyData[hour].car++;
        else if (s.vehicleType === VehicleType.MOTORCYCLE) hourlyData[hour].motorcycle++;
    });

    // Weekly Income (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
            date: d,
            label: format(d, 'EEE dd', { locale: es })
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

export const getSuperAdminStats = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal error' });

    try {
        // Counts
        const tenantsCount = await em.count(Tenant, { status: TenantStatus.ACTIVE });
        const locationsCount = await em.count(Location, { isActive: true });
        const usersCount = await em.count(User, { isActive: true });

        // Financials (Global)
        const startOfCurrentMonth = startOfMonth(new Date());
        const transactions = await em.find(Transaction, {
            type: { $in: [TransactionType.PARKING_REVENUE, TransactionType.MONTHLY_PAYMENT, TransactionType.WASH_SERVICE, TransactionType.INCOME] },
            timestamp: { $gte: startOfCurrentMonth }
        });

        const totalRevenueMonth = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

        // Recent Activity (Last 5 transactions globally)
        const recentTransactions = await em.find(Transaction, {}, {
            orderBy: { timestamp: 'DESC' },
            limit: 5,
            populate: ['tenant', 'location']
        });

        const activity = recentTransactions.map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            timestamp: t.timestamp,
            tenant: t.tenant?.name || 'Unknown',
            location: t.location?.name || 'Unknown'
        }));

        return res.json({
            counts: {
                tenants: tenantsCount,
                locations: locationsCount,
                users: usersCount,
                revenue: totalRevenueMonth
            },
            activity
        });
    } catch (error) {
        console.error('Super Admin Stats Error:', error);
        return res.status(500).json({ message: 'Error fetching super admin stats' });
    }
};
