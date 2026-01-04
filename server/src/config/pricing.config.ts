/**
 * Pricing configuration for Aparca SaaS plans
 */

export interface PlanFeatures {
    name: string;
    price: number; // Monthly price in USD
    maxLocations: number;
    maxUsers: number;
    maxSessions: number; // Monthly sessions limit
    features: string[];
    support: string;
}

export const PRICING_PLANS: Record<string, PlanFeatures> = {
    trial: {
        name: 'Trial',
        price: 0,
        maxLocations: 3,
        maxUsers: 5,
        maxSessions: 5000,
        features: [
            'All Pro features',
            '14 days free',
            'No credit card required'
        ],
        support: 'Email support'
    },
    basic: {
        name: 'Basic',
        price: 49,
        maxLocations: 1,
        maxUsers: 2,
        maxSessions: 1000,
        features: [
            '1 Location',
            '2 Users',
            '1,000 monthly sessions',
            'Basic reports',
            'Email support'
        ],
        support: 'Email (24-48h)'
    },
    pro: {
        name: 'Pro',
        price: 99,
        maxLocations: 3,
        maxUsers: 5,
        maxSessions: 5000,
        features: [
            '3 Locations',
            '5 Users',
            '5,000 monthly sessions',
            'Advanced reports',
            'Wash & POS modules',
            'Agreements/Discounts',
            'Email + WhatsApp support'
        ],
        support: 'Email + WhatsApp (12-24h)'
    },
    enterprise: {
        name: 'Enterprise',
        price: 0, // Custom pricing
        maxLocations: -1, // Unlimited
        maxUsers: -1, // Unlimited
        maxSessions: -1, // Unlimited
        features: [
            'Unlimited locations',
            'Unlimited users',
            'Unlimited sessions',
            'White-labeling',
            'Custom integrations',
            'Dedicated account manager',
            '24/7 Priority support'
        ],
        support: '24/7 Priority'
    }
};

/**
 * Get plan features by plan name
 */
export function getPlanFeatures(plan: string): PlanFeatures {
    return PRICING_PLANS[plan] || PRICING_PLANS.basic;
}

/**
 * Check if tenant can perform action based on plan limits
 */
export function canPerformAction(
    plan: string,
    action: 'addLocation' | 'addUser' | 'createSession',
    currentCount: number
): boolean {
    const features = getPlanFeatures(plan);

    switch (action) {
        case 'addLocation':
            return features.maxLocations === -1 || currentCount < features.maxLocations;
        case 'addUser':
            return features.maxUsers === -1 || currentCount < features.maxUsers;
        case 'createSession':
            return features.maxSessions === -1 || currentCount < features.maxSessions;
        default:
            return false;
    }
}

/**
 * Calculate prorated amount for plan changes
 */
export function calculateProration(
    currentPlan: string,
    newPlan: string,
    daysRemaining: number,
    daysInPeriod: number
): number {
    const currentPrice = PRICING_PLANS[currentPlan]?.price || 0;
    const newPrice = PRICING_PLANS[newPlan]?.price || 0;

    const unusedAmount = (currentPrice / daysInPeriod) * daysRemaining;
    const newAmount = (newPrice / daysInPeriod) * daysRemaining;

    return Math.max(0, newAmount - unusedAmount);
}

/**
 * Get annual discount (20% = 2 months free)
 */
export function getAnnualPrice(plan: string): number {
    const monthlyPrice = PRICING_PLANS[plan]?.price || 0;
    return monthlyPrice * 10; // 12 months - 2 free = 10 months
}
