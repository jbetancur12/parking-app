import cron from 'node-cron';
import { SubscriptionService } from '../services/subscription.service';

/**
 * Cron job to check expired subscriptions daily at midnight
 * Runs at 00:00 every day
 */
export function startSubscriptionCronJob() {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Running daily subscription check...');

        try {
            const subscriptionService = new SubscriptionService();
            const result = await subscriptionService.checkExpiredSubscriptions();

            console.log('✅ Subscription check completed:', {
                checked: result.checked,
                expired: result.expired,
                invoicesGenerated: result.invoicesGenerated,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error in subscription cron job:', error);
        }
    });

    console.log('✅ Subscription cron job started (runs daily at 00:00)');
}

/**
 * Optional: Run check immediately on startup (for testing)
 */
export async function runSubscriptionCheckNow() {
    console.log('🔄 Running immediate subscription check...');

    try {
        const subscriptionService = new SubscriptionService();
        const result = await subscriptionService.checkExpiredSubscriptions();

        console.log('✅ Immediate subscription check completed:', result);
    } catch (error) {
        console.error('❌ Error in immediate subscription check:', error);
    }
}
