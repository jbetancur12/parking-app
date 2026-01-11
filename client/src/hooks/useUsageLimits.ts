
import { useState, useEffect, useCallback } from 'react';
import { usageService, type UsageLimits } from '../services/usage.service';

export function useUsageLimits() {
    const [usage, setUsage] = useState<UsageLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUsage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await usageService.getCurrentUsage();
            setUsage(data);
        } catch (err: any) {
            console.error('Failed to load usage:', err);
            setError(err.response?.data?.message || 'Failed to load usage');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsage();

        const handleUsageUpdate = () => loadUsage();
        window.addEventListener('usage:updated', handleUsageUpdate);

        return () => window.removeEventListener('usage:updated', handleUsageUpdate);
    }, [loadUsage]);

    const hasWarnings = usage && (
        usage.sessions.warningLevel ||
        usage.users.warningLevel ||
        usage.locations.warningLevel
    );

    const isBlocked = usage && (
        usage.sessions.warningLevel === 'blocked' ||
        usage.users.warningLevel === 'blocked' ||
        usage.locations.warningLevel === 'blocked'
    );

    return {
        usage,
        loading,
        error,
        hasWarnings: hasWarnings as any,
        isBlocked,
        reload: loadUsage,
    };
}
