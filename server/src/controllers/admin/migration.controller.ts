import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Tenant } from '../../entities/Tenant';
import { Subscription } from '../../entities/Subscription';
import { SubscriptionService } from '../../services/subscription.service';

/**
 * MIGRATION ENDPOINT - Run once to create subscriptions for existing tenants
 * This should be removed after migration is complete
 */
export const migrateExistingTenants = async (req: Request, res: Response) => {
    try {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscriptionService = new SubscriptionService();

        // Find all tenants
        const allTenants = await em.find(Tenant, {});

        const results = {
            total: allTenants.length,
            migrated: 0,
            skipped: 0,
            errors: [] as string[],
        };

        for (const tenant of allTenants) {
            try {
                // Check if tenant already has a subscription
                const existingSubscription = await em.findOne(Subscription, { tenant: tenant.id });

                if (existingSubscription) {
                    console.log(`Tenant ${tenant.name} already has subscription, skipping`);
                    results.skipped++;
                    continue;
                }

                // Create subscription based on tenant's current plan
                const plan = tenant.plan || 'basic';
                await subscriptionService.createSubscription(tenant.id, plan);

                console.log(`✅ Created ${plan} subscription for tenant: ${tenant.name}`);
                results.migrated++;
            } catch (error: any) {
                console.error(`Failed to migrate tenant ${tenant.name}:`, error);
                results.errors.push(`${tenant.name}: ${error.message}`);
            }
        }

        return res.json({
            success: true,
            message: 'Migration completed',
            results
        });
    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({ message: 'Migration failed', error });
    }
};
