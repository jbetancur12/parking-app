import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if a feature is enabled for the current tenant.
 * Uses the pricingPlan featureFlags populated in the auth context.
 * 
 * @param featureKey The key of the feature flag to check (e.g., 'can_export_reports')
 * @returns boolean true if enabled, false otherwise.
 */
export function useFeature(featureKey: string): boolean {
    const { user } = useAuth();

    // Check if user has active tenant session
    // We assume the first tenant in the array is the current context for now
    // In a multi-tenant switcher scenario, this might need refinement
    // But AuthContext login/impersonate sets the token for a specific context usually.
    const currentTenant = user?.tenants?.[0];

    if (!currentTenant) return false;

    // 1. Check dynamic feature flags from DB (PricingPlan)
    const flags = currentTenant.pricingPlan?.featureFlags;
    if (flags && flags[featureKey] !== undefined) {
        return flags[featureKey];
    }

    // 2. Fallback? 
    // If the flag is not defined, default to false.
    // Or we could implement static fallbacks here if we wanted mix-and-match.
    // For "No-Code" pure philosophy, we trust the DB.

    return false;
}
