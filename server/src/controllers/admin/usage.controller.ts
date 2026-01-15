import { Request, Response } from 'express';
import { UsageService } from '../../services/usage.service';
import { RequestContext } from '@mikro-orm/core';
import { Tenant } from '../../entities/Tenant';
import { logger } from '../../utils/logger';

const usageService = new UsageService();

/**
 * Get usage overview for all tenants (SuperAdmin only)
 */
export const getAllTenantsUsage = async (req: Request, res: Response) => {
    try {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('No EntityManager found');

        const tenants = await em.find(Tenant, {}, { populate: ['locations', 'users'] });

        const tenantsWithUsage = await Promise.all(
            tenants.map(async (tenant) => {
                const [sessionsCheck, usersCheck, locationsCheck] = await Promise.all([
                    usageService.checkLimits(tenant.id, 'createSession'),
                    usageService.checkLimits(tenant.id, 'addUser'),
                    usageService.checkLimits(tenant.id, 'addLocation'),
                ]);

                const hasWarnings = sessionsCheck.warningLevel || usersCheck.warningLevel || locationsCheck.warningLevel;
                const isBlocked = sessionsCheck.blocked || usersCheck.blocked || locationsCheck.blocked;
                const isCritical =
                    sessionsCheck.warningLevel === 'critical' ||
                    usersCheck.warningLevel === 'critical' ||
                    locationsCheck.warningLevel === 'critical';

                return {
                    id: tenant.id,
                    name: tenant.name,
                    plan: tenant.plan,
                    usage: {
                        sessions: {
                            current: sessionsCheck.currentCount,
                            limit: sessionsCheck.limit,
                            percentage: sessionsCheck.limit === Infinity ? 0 : (sessionsCheck.currentCount / sessionsCheck.limit) * 100,
                            warningLevel: sessionsCheck.blocked ? 'blocked' : sessionsCheck.warningLevel,
                        },
                        users: {
                            current: usersCheck.currentCount,
                            limit: usersCheck.limit,
                            percentage: usersCheck.limit === Infinity ? 0 : (usersCheck.currentCount / usersCheck.limit) * 100,
                            warningLevel: usersCheck.blocked ? 'blocked' : usersCheck.warningLevel,
                        },
                        locations: {
                            current: locationsCheck.currentCount,
                            limit: locationsCheck.limit,
                            percentage: locationsCheck.limit === Infinity ? 0 : (locationsCheck.currentCount / locationsCheck.limit) * 100,
                            warningLevel: locationsCheck.blocked ? 'blocked' : locationsCheck.warningLevel,
                        },
                    },
                    hasWarnings,
                    isBlocked,
                    isCritical,
                };
            })
        );

        // Sort: blocked first, then critical, then warnings, then normal
        tenantsWithUsage.sort((a, b) => {
            if (a.isBlocked && !b.isBlocked) return -1;
            if (!a.isBlocked && b.isBlocked) return 1;
            if (a.isCritical && !b.isCritical) return -1;
            if (!a.isCritical && b.isCritical) return 1;
            if (a.hasWarnings && !b.hasWarnings) return -1;
            if (!a.hasWarnings && b.hasWarnings) return 1;
            return 0;
        });

        return res.json(tenantsWithUsage);
    } catch (error) {
        logger.error({ error }, 'Get all tenants usage error:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get usage for a specific tenant (SuperAdmin only)
 */
export const getTenantUsage = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.params;

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
        logger.error({ error }, 'Get tenant usage error:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
