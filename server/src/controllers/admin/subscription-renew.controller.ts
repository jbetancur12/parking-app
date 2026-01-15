
import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Subscription, SubscriptionStatus } from '../../entities/Subscription';
import { logger } from '../../utils/logger';
import { addMonths } from 'date-fns';

/**
 * Manually renew a subscription (for fixing stuck PAST_DUE subscriptions)
 */
export const renewSubscription = async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;

        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscription = await em.findOne(Subscription, { id: subscriptionId }, {
            populate: ['tenant']
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        const oldStatus = subscription.status;
        const oldPeriodEnd = subscription.currentPeriodEnd;

        // Reactivate and renew
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.currentPeriodStart = subscription.currentPeriodEnd;
        subscription.currentPeriodEnd = addMonths(subscription.currentPeriodEnd, 1);

        await em.flush();

        return res.json({
            message: 'Subscription renewed successfully',
            subscription: {
                id: subscription.id,
                tenant: subscription.tenant.name,
                oldStatus,
                newStatus: subscription.status,
                oldPeriodEnd,
                newPeriodEnd: subscription.currentPeriodEnd
            }
        });
    } catch (error: any) {
        logger.error({ error }, 'Renew subscription error:');
        return res.status(500).json({
            message: 'Failed to renew subscription',
            error: error.message
        });
    }
};
