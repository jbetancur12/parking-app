import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Tenant, TenantStatus } from '../../entities/Tenant';
import { User, UserRole } from '../../entities/User';
import { Subscription, SubscriptionStatus } from '../../entities/Subscription';
import { logger } from '../../utils/logger';

export const getDashboardMetrics = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        // Total tenants
        const totalTenants = await em.count(Tenant);

        // Active tenants (status = ACTIVE)
        const activeTenants = await em.count(Tenant, { status: TenantStatus.ACTIVE });

        // Inactive/Suspended tenants
        const inactiveTenants = totalTenants - activeTenants;

        // Calculate MRR (Monthly Recurring Revenue)
        const activeSubscriptions = await em.find(Subscription, {
            status: SubscriptionStatus.ACTIVE
        });

        const mrr = activeSubscriptions.reduce((sum, sub) => {
            return sum + (sub.amount || 0);
        }, 0);

        // Total users across all tenants
        const totalUsers = await em.count(User, { role: { $ne: UserRole.SUPER_ADMIN } as any });

        // Active users (logged in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await em.count(User, {
            role: { $ne: UserRole.SUPER_ADMIN } as any,
            lastLoginAt: { $gte: thirtyDaysAgo }
        });

        return res.json({
            totalTenants,
            activeTenants,
            inactiveTenants,
            mrr,
            totalUsers,
            activeUsers,
            activeUsersPercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching dashboard metrics');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getChurnMetrics = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const period = req.query.period as string || '30'; // days
        const daysAgo = parseInt(period);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Tenants at start of period
        const tenantsAtStart = await em.count(Tenant, {
            createdAt: { $lt: startDate }
        });

        // Tenants that became inactive during period
        const churnedTenants = await em.count(Tenant, {
            status: { $ne: TenantStatus.ACTIVE },
            updatedAt: { $gte: startDate }
        });

        // Calculate churn rate
        const churnRate = tenantsAtStart > 0 ? (churnedTenants / tenantsAtStart) * 100 : 0;

        return res.json({
            period: daysAgo,
            tenantsAtStart,
            churnedTenants,
            churnRate: parseFloat(churnRate.toFixed(2))
        });
    } catch (error) {
        logger.error({ error }, 'Error calculating churn');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLTVMetrics = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        // Get all subscriptions
        const subscriptions = await em.find(Subscription, {});

        if (subscriptions.length === 0) {
            return res.json({
                averageLTV: 0,
                averageLifetimeMonths: 0,
                averageMonthlyRevenue: 0
            });
        }

        // Calculate average monthly revenue per tenant
        const activeSubscriptions = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
        const avgMonthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
            return sum + (sub.amount || 0);
        }, 0) / (activeSubscriptions.length || 1);

        // Calculate average lifetime (months) - from creation to now or cancellation
        const now = new Date();
        const lifetimes = subscriptions.map(sub => {
            const start = sub.createdAt;
            const end = sub.cancelledAt || now;
            const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
            return Math.max(months, 0);
        });

        const avgLifetimeMonths = lifetimes.reduce((sum, m) => sum + m, 0) / lifetimes.length;

        // LTV = Average Monthly Revenue * Average Lifetime
        const ltv = avgMonthlyRevenue * avgLifetimeMonths;

        return res.json({
            averageLTV: parseFloat(ltv.toFixed(2)),
            averageLifetimeMonths: parseFloat(avgLifetimeMonths.toFixed(1)),
            averageMonthlyRevenue: parseFloat(avgMonthlyRevenue.toFixed(2))
        });
    } catch (error) {
        logger.error({ error }, 'Error calculating LTV');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getActiveUsage = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const totalUsers = await em.count(User, { role: { $ne: UserRole.SUPER_ADMIN } as any });

        // Active in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeLastWeek = await em.count(User, {
            role: { $ne: UserRole.SUPER_ADMIN } as any,
            lastLoginAt: { $gte: sevenDaysAgo }
        });

        // Active in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeLastMonth = await em.count(User, {
            role: { $ne: UserRole.SUPER_ADMIN } as any,
            lastLoginAt: { $gte: thirtyDaysAgo }
        });

        // Inactive users
        const inactiveUsers = totalUsers - activeLastMonth;

        return res.json({
            totalUsers,
            activeLastWeek,
            activeLastMonth,
            inactiveUsers,
            activeWeekPercentage: totalUsers > 0 ? (activeLastWeek / totalUsers) * 100 : 0,
            activeMonthPercentage: totalUsers > 0 ? (activeLastMonth / totalUsers) * 100 : 0
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching active usage');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTrends = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const months = parseInt(req.query.months as string) || 6;
        const trends = [];

        for (let i = months - 1; i >= 0; i--) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() - i);
            endDate.setDate(1); // First day of month

            const startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 1);

            const nextMonth = new Date(endDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            // Count tenants created in this month
            const newTenants = await em.count(Tenant, {
                createdAt: { $gte: endDate, $lt: nextMonth }
            });

            // Count active subscriptions in this month
            const activeSubscriptions = await em.find(Subscription, {
                status: SubscriptionStatus.ACTIVE,
                createdAt: { $lte: nextMonth }
            });

            const mrr = activeSubscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

            // Total tenants at end of month
            const totalTenants = await em.count(Tenant, {
                createdAt: { $lt: nextMonth }
            });

            trends.push({
                month: endDate.toISOString().slice(0, 7), // YYYY-MM format
                newTenants,
                totalTenants,
                mrr: parseFloat(mrr.toFixed(2))
            });
        }

        return res.json(trends);
    } catch (error) {
        logger.error({ error }, 'Error fetching trends');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
