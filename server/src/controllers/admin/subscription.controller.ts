import { Request, Response } from 'express';
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
        console.error('Check expired subscriptions error:', error);
        return res.status(500).json({
            message: 'Failed to check expired subscriptions',
            error: error.message
        });
    }
};
