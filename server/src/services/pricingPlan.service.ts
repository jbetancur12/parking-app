import { RequestContext } from '@mikro-orm/core';
import { PricingPlan } from '../entities/PricingPlan';

export class PricingPlanService {
    /**
     * Get all pricing plans
     */
    async getAllPlans(includeInactive: boolean = false): Promise<PricingPlan[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const where = includeInactive ? {} : { isActive: true };

        return await em.find(PricingPlan, where, {
            orderBy: { displayOrder: 'ASC' }
        });
    }

    /**
     * Get plan by code
     */
    async getPlanByCode(code: string): Promise<PricingPlan | null> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.findOne(PricingPlan, { code });
    }

    /**
     * Update plan configuration
     */
    async updatePlan(code: string, data: {
        name?: string;
        price?: number;
        maxLocations?: number;
        maxUsers?: number;
        maxSessions?: number;
        features?: string[];
        support?: string;
        displayOrder?: number;
    }): Promise<PricingPlan> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const plan = await em.findOne(PricingPlan, { code });
        if (!plan) throw new Error('Plan not found');

        // Update fields
        if (data.name !== undefined) plan.name = data.name;
        if (data.price !== undefined) plan.price = data.price;
        if (data.maxLocations !== undefined) plan.maxLocations = data.maxLocations;
        if (data.maxUsers !== undefined) plan.maxUsers = data.maxUsers;
        if (data.maxSessions !== undefined) plan.maxSessions = data.maxSessions;
        if (data.features !== undefined) plan.features = data.features;
        if (data.support !== undefined) plan.support = data.support;
        if (data.displayOrder !== undefined) plan.displayOrder = data.displayOrder;

        await em.flush();
        return plan;
    }

    /**
     * Toggle plan active status
     */
    async togglePlanStatus(code: string, isActive: boolean): Promise<PricingPlan> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const plan = await em.findOne(PricingPlan, { code });
        if (!plan) throw new Error('Plan not found');

        plan.isActive = isActive;
        await em.flush();

        return plan;
    }

    /**
     * Get plan features as object (for backward compatibility)
     */
    getPlanFeatures(code: string, plans: PricingPlan[]) {
        const plan = plans.find(p => p.code === code);
        if (!plan) return null;

        return {
            name: plan.name,
            price: plan.price,
            maxLocations: plan.maxLocations,
            maxUsers: plan.maxUsers,
            maxSessions: plan.maxSessions,
            features: plan.features,
            support: plan.support
        };
    }
}
