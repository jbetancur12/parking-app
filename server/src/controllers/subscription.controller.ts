import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { SubscriptionService } from '../services/subscription.service';
import { PRICING_PLANS } from '../config/pricing.config';

const subscriptionService = new SubscriptionService();

/**
 * Get current subscription for authenticated tenant
 */
export const getCurrentSubscription = async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).tenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const subscription = await subscriptionService.getByTenant(tenantId);

        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found' });
        }

        return res.json(subscription);
    } catch (error) {
        console.error('Get subscription error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get all available plans
 */
export const getPlans = async (req: Request, res: Response) => {
    try {
        return res.json(PRICING_PLANS);
    } catch (error) {
        console.error('Get plans error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Upgrade or downgrade subscription
 */
export const changePlan = async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).tenantId;
        const { plan } = req.body;

        if (!tenantId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!plan || !PRICING_PLANS[plan]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const subscription = await subscriptionService.changePlan(tenantId, plan);

        return res.json({
            message: `Plan changed to ${plan} successfully`,
            subscription
        });
    } catch (error) {
        console.error('Change plan error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).tenantId;
        const { immediately } = req.body;

        if (!tenantId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const subscription = await subscriptionService.cancelSubscription(tenantId, immediately);

        return res.json({
            message: immediately ? 'Subscription cancelled immediately' : 'Subscription will cancel at period end',
            subscription
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get all subscriptions (admin only)
 */
export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await subscriptionService.getAll();
        return res.json(subscriptions);
    } catch (error) {
        console.error('Get all subscriptions error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
