import cron from 'node-cron';
import { SubscriptionService } from '../services/subscription.service';

import { logger } from '../utils/logger';

/**
 * Cron job to check expired subscriptions daily at midnight
 * Runs at 00:00 every day
 */
export function startSubscriptionCronJob() {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        logger.info('🔄 Running daily subscription check...');

        try {
            const subscriptionService = new SubscriptionService();
            const result = await subscriptionService.checkExpiredSubscriptions();

            logger.info({
                checked: result.checked,
                expired: result.expired,
                invoicesGenerated: result.invoicesGenerated,
                timestamp: new Date().toISOString()
            }, '✅ Subscription check completed');
        } catch (error) {
            logger.error({ error }, '❌ Error in subscription cron job');
        }
    });

    logger.info('✅ Subscription cron job started (runs daily at 00:00)');
}

/**
 * Optional: Run check immediately on startup (for testing)
 */
export async function runSubscriptionCheckNow() {
    logger.info('🔄 Running immediate subscription check...');

    try {
        const subscriptionService = new SubscriptionService();
        const result = await subscriptionService.checkExpiredSubscriptions();

        logger.info({ result }, '✅ Immediate subscription check completed');
    } catch (error) {
        logger.error({ error }, '❌ Error in immediate subscription check');
    }
}
