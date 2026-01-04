import { RequestContext } from '@mikro-orm/core';
import { UsageRecord } from '../entities/UsageRecord';
import { Tenant } from '../entities/Tenant';
import { format } from 'date-fns';
import { getPlanFeatures, canPerformAction } from '../config/pricing.config';

export class UsageService {
    /**
     * Track a new session (called when parking session is created)
     */
    async trackSession(tenantId: string): Promise<void> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const month = format(new Date(), 'yyyy-MM');

        let usage = await em.findOne(UsageRecord, { tenant: tenantId, month });

        if (!usage) {
            const tenant = await em.findOne(Tenant, { id: tenantId });
            if (!tenant) throw new Error('Tenant not found');

            usage = em.create(UsageRecord, {
                tenant,
                month,
                sessionsCount: 0,
                usersCount: 0,
                locationsCount: 0,
            } as any);
        }

        usage.sessionsCount++;
        await em.flush();
    }

    /**
     * Get monthly usage for a tenant
     */
    async getMonthlyUsage(tenantId: string, month?: string): Promise<UsageRecord | null> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const targetMonth = month || format(new Date(), 'yyyy-MM');

        return await em.findOne(UsageRecord, { tenant: tenantId, month: targetMonth });
    }

    /**
     * Check if tenant can perform action (soft limit)
     */
    async checkLimits(tenantId: string, action: 'addLocation' | 'addUser' | 'createSession'): Promise<{
        allowed: boolean;
        warning?: string;
        currentCount: number;
        limit: number;
    }> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const tenant = await em.findOne(Tenant, { id: tenantId }, {
            populate: ['locations', 'users']
        });
        if (!tenant) throw new Error('Tenant not found');

        const planFeatures = getPlanFeatures(tenant.plan);
        let currentCount = 0;
        let limit = 0;

        switch (action) {
            case 'addLocation':
                currentCount = tenant.locations.length;
                limit = planFeatures.maxLocations;
                break;
            case 'addUser':
                currentCount = tenant.users.length;
                limit = planFeatures.maxUsers;
                break;
            case 'createSession':
                const usage = await this.getMonthlyUsage(tenantId);
                currentCount = usage?.sessionsCount || 0;
                limit = planFeatures.maxSessions;
                break;
        }

        // Soft limit: allow but warn
        const allowed = true; // Always allow (soft limit)
        const isOverLimit = limit !== -1 && currentCount >= limit;

        let warning: string | undefined;
        if (isOverLimit) {
            warning = `You have reached your plan limit of ${limit} ${action.replace('add', '').replace('create', '')}s. Consider upgrading your plan.`;
        } else if (limit !== -1 && currentCount >= limit * 0.8) {
            warning = `You are approaching your plan limit (${currentCount}/${limit}). Consider upgrading soon.`;
        }

        return {
            allowed,
            warning,
            currentCount,
            limit: limit === -1 ? Infinity : limit
        };
    }

    /**
     * Update user and location counts (called periodically)
     */
    async updateCounts(tenantId: string): Promise<void> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const tenant = await em.findOne(Tenant, { id: tenantId }, {
            populate: ['locations', 'users']
        });
        if (!tenant) throw new Error('Tenant not found');

        const month = format(new Date(), 'yyyy-MM');
        let usage = await em.findOne(UsageRecord, { tenant: tenantId, month });

        if (!usage) {
            usage = em.create(UsageRecord, {
                tenant,
                month,
                sessionsCount: 0,
                usersCount: 0,
                locationsCount: 0,
            } as any);
        }

        usage.usersCount = tenant.users.length;
        usage.locationsCount = tenant.locations.length;

        await em.flush();
    }

    /**
     * Get usage history for a tenant
     */
    async getHistory(tenantId: string, months: number = 6): Promise<UsageRecord[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(UsageRecord, { tenant: tenantId }, {
            orderBy: { month: 'DESC' },
            limit: months
        });
    }
}
