import { TenantPlan } from "../entities/Tenant";

export const SAAS_PLANS: Record<TenantPlan, { maxLocations: number; maxUsers: number; price: number; label: string }> = {
    [TenantPlan.FREE]: {
        maxLocations: 1,
        maxUsers: 2,
        price: 0,
        label: 'Gratis'
    },
    [TenantPlan.TRIAL]: {
        maxLocations: 1,
        maxUsers: 5,
        price: 0,
        label: 'Prueba (14 Días)'
    },
    [TenantPlan.PRO]: {
        maxLocations: 5,
        maxUsers: 10,
        price: 50000,
        label: 'Pro'
    },
    [TenantPlan.ENTERPRISE]: {
        maxLocations: 100,
        maxUsers: 1000,
        price: 200000,
        label: 'Enterprise'
    }
};
