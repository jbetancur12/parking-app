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
     * Check if tenant can perform action with configurable soft/hard limits
     */
    async checkLimits(tenantId: string, action: 'addLocation' | 'addUser' | 'createSession'): Promise<{
        allowed: boolean;
        blocked: boolean;
        warning?: string;
        warningLevel?: 'soft' | 'critical';
        currentCount: number;
        limit: number;
        softLimit: number;
        hardLimit: number;
    }> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const tenant = await em.findOne(Tenant, { id: tenantId }, {
            populate: ['locations', 'users']
        });
        if (!tenant) throw new Error('Tenant not found');

        // Get plan from database with tolerances
        const { PricingPlanService } = await import('./pricingPlan.service');
        const pricingService = new PricingPlanService();
        const plan = await pricingService.getPlanByCode(tenant.plan);

        if (!plan) {
            // Fallback to config if plan not found in DB
            const planFeatures = getPlanFeatures(tenant.plan);
            return this.checkLimitsWithConfig(action, tenant, planFeatures);
        }

        let currentCount = 0;
        let limit = 0;

        switch (action) {
            case 'addLocation':
                currentCount = tenant.locations.length;
                limit = plan.maxLocations;
                break;
            case 'addUser':
                currentCount = tenant.users.length;
                limit = plan.maxUsers;
                break;
            case 'createSession':
                const usage = await this.getMonthlyUsage(tenantId);
                currentCount = usage?.sessionsCount || 0;
                limit = plan.maxSessions;
                break;
        }

        // Calculate thresholds
        const softLimit = limit === -1 ? Infinity : Math.floor(limit * plan.softLimitPercentage);
        const hardLimit = limit === -1 ? Infinity : Math.floor(limit * plan.hardLimitPercentage);

        // Determine status
        const blocked = limit !== -1 && currentCount >= hardLimit;
        const allowed = !blocked;

        let warning: string | undefined;
        let warningLevel: 'soft' | 'critical' | undefined;

        if (blocked) {
            warning = `BLOQUEADO: Has excedido el límite máximo (${currentCount}/${hardLimit}). Actualiza tu plan para continuar.`;
            warningLevel = 'critical';
        } else if (limit !== -1 && currentCount >= limit) {
            // Over plan limit but within tolerance
            warning = `ADVERTENCIA CRÍTICA: Has excedido tu límite del plan (${currentCount}/${limit}). Estás en tolerancia hasta ${hardLimit}.`;
            warningLevel = 'critical';
        } else if (limit !== -1 && currentCount >= softLimit) {
            // Approaching limit
            warning = `ADVERTENCIA: Estás cerca de tu límite (${currentCount}/${limit}). Considera actualizar tu plan.`;
            warningLevel = 'soft';
        }

        return {
            allowed,
            blocked,
            warning,
            warningLevel,
            currentCount,
            limit: limit === -1 ? Infinity : limit,
            softLimit,
            hardLimit
        };
    }

    /**
     * Fallback method using config file
     */
    private async checkLimitsWithConfig(action: string, tenant: any, planFeatures: any) {
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
                const usage = await this.getMonthlyUsage(tenant.id);
                currentCount = usage?.sessionsCount || 0;
                limit = planFeatures.maxSessions;
                break;
        }

        const softLimit = limit === -1 ? Infinity : Math.floor(limit * 0.8);
        const hardLimit = limit === -1 ? Infinity : Math.floor(limit * 1.2);

        const blocked = limit !== -1 && currentCount >= hardLimit;
        const allowed = !blocked;

        let warning: string | undefined;
        let warningLevel: 'soft' | 'critical' | undefined;

        if (blocked) {
            warning = `BLOQUEADO: Has excedido el límite máximo. Actualiza tu plan.`;
            warningLevel = 'critical';
        } else if (limit !== -1 && currentCount >= limit) {
            warning = `ADVERTENCIA CRÍTICA: Has excedido tu límite del plan.`;
            warningLevel = 'critical';
        } else if (limit !== -1 && currentCount >= softLimit) {
            warning = `ADVERTENCIA: Estás cerca de tu límite.`;
            warningLevel = 'soft';
        }

        return {
            allowed,
            blocked,
            warning,
            warningLevel,
            currentCount,
            limit: limit === -1 ? Infinity : limit,
            softLimit,
            hardLimit
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
