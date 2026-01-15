import { RequestContext } from '@mikro-orm/core';
import { Subscription, SubscriptionStatus } from '../entities/Subscription';
import { Tenant } from '../entities/Tenant';
import { Invoice, InvoiceStatus } from '../entities/Invoice';
import { getPlanFeatures, PRICING_PLANS } from '../config/pricing.config';
import { addDays, addMonths } from 'date-fns';
import { logger } from '../utils/logger';

export class SubscriptionService {
    /**
     * Create a new subscription for a tenant (called on registration)
     */
    async createSubscription(tenantId: string, plan: string = 'trial'): Promise<Subscription> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const tenant = await em.findOne(Tenant, { id: tenantId });
        if (!tenant) throw new Error('Tenant not found');

        const planFeatures = getPlanFeatures(plan);
        const now = new Date();

        const subscription = em.create(Subscription, {
            tenant,
            plan,
            status: plan === 'trial' ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
            amount: planFeatures.price,
            currency: 'USD',
            currentPeriodStart: now,
            currentPeriodEnd: plan === 'trial' ? addDays(now, 14) : addMonths(now, 1),
            trialStart: plan === 'trial' ? now : undefined,
            trialEnd: plan === 'trial' ? addDays(now, 14) : undefined,
        } as any);

        await em.persistAndFlush(subscription);
        logger.info({ tenantId, plan, subscriptionId: subscription.id }, 'Subscription created');
        return subscription;
    }

    /**
     * Upgrade or downgrade a subscription
     */
    async changePlan(tenantId: string, newPlan: string): Promise<Subscription> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscription = await em.findOne(Subscription, { tenant: tenantId });
        if (!subscription) throw new Error('Subscription not found');

        const tenant = await em.findOne(Tenant, { id: tenantId });
        if (!tenant) throw new Error('Tenant not found');

        const oldPlan = subscription.plan;
        const newPlanFeatures = getPlanFeatures(newPlan);

        // Update subscription
        subscription.plan = newPlan;
        subscription.amount = newPlanFeatures.price;
        subscription.status = SubscriptionStatus.ACTIVE;

        // Update tenant plan and limits
        tenant.plan = newPlan as any;
        tenant.maxLocations = newPlanFeatures.maxLocations;
        tenant.maxUsers = newPlanFeatures.maxUsers;

        await em.flush();

        logger.info({
            tenantId,
            oldPlan,
            newPlan,
            subscriptionId: subscription.id
        }, 'Subscription plan changed');
        return subscription;
    }

    /**
     * Cancel a subscription (at period end)
     */
    async cancelSubscription(tenantId: string, immediately: boolean = false): Promise<Subscription> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscription = await em.findOne(Subscription, { tenant: tenantId });
        if (!subscription) throw new Error('Subscription not found');

        if (immediately) {
            subscription.status = SubscriptionStatus.CANCELLED;
            subscription.cancelledAt = new Date();
        } else {
            subscription.cancelAtPeriodEnd = true;
        }

        await em.flush();
        return subscription;
    }

    /**
     * Renew subscription for next period
     */
    async renewSubscription(subscriptionId: string): Promise<Subscription> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscription = await em.findOne(Subscription, { id: subscriptionId });
        if (!subscription) throw new Error('Subscription not found');

        // Move to next period
        subscription.currentPeriodStart = subscription.currentPeriodEnd;
        subscription.currentPeriodEnd = addMonths(subscription.currentPeriodEnd, 1);

        // Always activate subscription on renewal (covers PAST_DUE and TRIALLING)
        subscription.status = SubscriptionStatus.ACTIVE;

        await em.flush();
        logger.info({ subscriptionId, newPeriodEnd: subscription.currentPeriodEnd }, 'Subscription renewed');
        return subscription;
    }

    /**
     * Check if trial has ended and downgrade if needed
     */
    async checkTrialStatus(tenantId: string): Promise<void> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const subscription = await em.findOne(Subscription, { tenant: tenantId });
        if (!subscription) return;

        if (subscription.status === SubscriptionStatus.TRIALING && subscription.trialEnd) {
            if (new Date() > subscription.trialEnd) {
                // Trial ended, downgrade to basic
                await this.changePlan(tenantId, 'basic');
                logger.info({ tenantId }, 'Trial ended, downgraded to basic');
            }
        }
    }

    /**
     * Get subscription by tenant ID
     */
    async getByTenant(tenantId: string): Promise<Subscription | null> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.findOne(Subscription, { tenant: tenantId }, {
            populate: ['invoices']
        });
    }

    /**
     * Check for expired subscriptions and generate invoices
     * Should be called periodically (cron job) or manually
     */
    async checkExpiredSubscriptions(): Promise<{ checked: number; expired: number; invoicesGenerated: number }> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const { InvoiceService } = await import('./invoice.service');
        const invoiceService = new InvoiceService();

        const now = new Date();
        const subscriptions = await em.find(Subscription, {
            status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] }
        }, {
            populate: ['tenant', 'invoices']
        });

        let expiredCount = 0;
        let invoicesGenerated = 0;

        for (const subscription of subscriptions) {
            // Check if period has ended
            if (subscription.currentPeriodEnd < now) {
                expiredCount++;

                // Check if invoice already exists for this period
                const existingInvoice = subscription.invoices.getItems().find(inv =>
                    inv.dueDate.getTime() === subscription.currentPeriodEnd.getTime() &&
                    inv.status !== 'void'
                );

                if (!existingInvoice) {
                    // Generate invoice for the expired period
                    await invoiceService.generateMonthlyInvoice(subscription.id);
                    invoicesGenerated++;
                    logger.info({ subscriptionId: subscription.id }, 'Generated invoice for expired subscription');
                }

                // Mark subscription as past_due if not cancelled
                if (!subscription.cancelAtPeriodEnd) {
                    subscription.status = SubscriptionStatus.PAST_DUE;
                    logger.warn({ subscriptionId: subscription.id }, 'Marked subscription as PAST_DUE');
                }
            }
        }

        await em.flush();

        return {
            checked: subscriptions.length,
            expired: expiredCount,
            invoicesGenerated
        };
    }

    /**
     * Get all subscriptions (admin)
     */
    async getAll(): Promise<Subscription[]> {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        return await em.find(Subscription, {}, {
            populate: ['tenant'],
            orderBy: { createdAt: 'DESC' }
        });
    }
}
