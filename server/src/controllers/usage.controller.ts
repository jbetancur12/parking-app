import { Request, Response } from 'express';
import { UsageService } from '../services/usage.service';
import { RequestContext } from '@mikro-orm/core';
import { Tenant } from '../entities/Tenant';

const usageService = new UsageService();

/**
 * Get current usage and limits for the tenant
 */
export const getCurrentUsage = async (req: Request, res: Response) => {
    try {
        // Try to get tenantId from multiple sources
        const tenantId = req.tenant?.id || (req.headers['x-tenant-id'] as string) || (req as any).tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant ID required' });
        }

        // Get usage for all three metrics
        const [sessionsCheck, usersCheck, locationsCheck] = await Promise.all([
            usageService.checkLimits(tenantId, 'createSession'),
            usageService.checkLimits(tenantId, 'addUser'),
            usageService.checkLimits(tenantId, 'addLocation'),
        ]);

        const response = {
            sessions: {
                current: sessionsCheck.currentCount,
                limit: sessionsCheck.limit,
                softLimit: sessionsCheck.softLimit,
                hardLimit: sessionsCheck.hardLimit,
                percentage: sessionsCheck.limit === Infinity ? 0 : (sessionsCheck.currentCount / sessionsCheck.limit) * 100,
                warningLevel: sessionsCheck.blocked ? 'blocked' : sessionsCheck.warningLevel,
            },
            users: {
                current: usersCheck.currentCount,
                limit: usersCheck.limit,
                softLimit: usersCheck.softLimit,
                hardLimit: usersCheck.hardLimit,
                percentage: usersCheck.limit === Infinity ? 0 : (usersCheck.currentCount / usersCheck.limit) * 100,
                warningLevel: usersCheck.blocked ? 'blocked' : usersCheck.warningLevel,
            },
            locations: {
                current: locationsCheck.currentCount,
                limit: locationsCheck.limit,
                softLimit: locationsCheck.softLimit,
                hardLimit: locationsCheck.hardLimit,
                percentage: locationsCheck.limit === Infinity ? 0 : (locationsCheck.currentCount / locationsCheck.limit) * 100,
                warningLevel: locationsCheck.blocked ? 'blocked' : locationsCheck.warningLevel,
            },
        };

        return res.json(response);
    } catch (error) {
        console.error('Get current usage error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
