import { Request, Response } from 'express';
import { Subscription, SubscriptionStatus } from '../../entities/Subscription';
import { logger } from '../../utils/logger';
import { SubscriptionService } from '../../services/subscription.service';

const subscriptionService = new SubscriptionService();

/**
 * Check for expired subscriptions and generate invoices
 * Can be called manually or via cron job
 */
export const checkExpiredSubscriptions = async (req: Request, res: Response) => {
    try {
        const result = await subscriptionService.checkExpiredSubscriptions();

        return res.json({
            message: 'Subscription check completed',
            ...result
        });
    } catch (error: any) {
        logger.error({ error }, 'Check expired subscriptions error:');
        return res.status(500).json({
            message: 'Failed to check expired subscriptions',
            error: error.message
        });
    }
};
