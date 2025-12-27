import { TenantPlan } from "../entities/Tenant";

export const SAAS_PLANS: Record<TenantPlan, { maxLocations: number; maxUsers: number; price: number; label: string; features: string[] }> = {
    [TenantPlan.BASIC]: {
        maxLocations: 1,
        maxUsers: 2,
        price: 50000,
        label: 'Básico',
        features: ['PARKING_ONLY']
    },
    [TenantPlan.TRIAL]: {
        maxLocations: 1,
        maxUsers: 2,
        price: 0,
        label: 'Prueba (14 Días)',
        features: ['PARKING_ONLY', 'WASH_SERVICE', 'INVENTORY', 'LOYALTY']
    },
    [TenantPlan.PRO]: {
        maxLocations: 5,
        maxUsers: 6,
        price: 80000,
        label: 'Pro',
        features: ['PARKING_ONLY', 'WASH_SERVICE', 'INVENTORY', 'LOYALTY']
    },
    [TenantPlan.ENTERPRISE]: {
        maxLocations: 10,
        maxUsers: 20,
        price: 120000,
        label: 'Enterprise',
        features: ['PARKING_ONLY', 'WASH_SERVICE', 'INVENTORY', 'LOYALTY', 'API_ACCESS', 'PRIORITY_SUPPORT']
    }
};
