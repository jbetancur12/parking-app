import { Request, Response, NextFunction } from 'express';
import { UsageService } from '../services/usage.service';
import { logger } from '../utils/logger';

const usageService = new UsageService();

/**
 * Middleware to check usage limits before creating parking sessions
 * Enforces hard limits and provides warnings for soft limits
 */
export const checkSessionLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = (req as any).tenantId || (req as any).user?.tenant?.id;

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant ID required' });
        }

        // Check if tenant can create session
        const limitCheck = await usageService.checkLimits(tenantId, 'createSession');

        if (limitCheck.blocked) {
            return res.status(403).json({
                message: 'Límite de sesiones excedido',
                error: limitCheck.warning,
                details: {
                    currentCount: limitCheck.currentCount,
                    limit: limitCheck.limit,
                    hardLimit: limitCheck.hardLimit,
                    upgradeRequired: true
                }
            });
        }

        // Attach warning to request for controller to include in response
        if (limitCheck.warning) {
            (req as any).usageWarning = {
                message: limitCheck.warning,
                level: limitCheck.warningLevel,
                currentCount: limitCheck.currentCount,
                limit: limitCheck.limit,
                softLimit: limitCheck.softLimit,
                hardLimit: limitCheck.hardLimit
            };
        }

        next();
    } catch (error) {
        logger.error({ error }, 'Error checking session limit');
        // Don't block on error, just log and continue
        next();
    }
};

/**
 * Middleware to check location limits
 */
export const checkLocationLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = (req as any).tenantId || (req as any).user?.tenant?.id;

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant ID required' });
        }

        const limitCheck = await usageService.checkLimits(tenantId, 'addLocation');

        if (limitCheck.blocked) {
            return res.status(403).json({
                message: 'Límite de sedes excedido',
                error: limitCheck.warning,
                details: {
                    currentCount: limitCheck.currentCount,
                    limit: limitCheck.limit,
                    hardLimit: limitCheck.hardLimit,
                    upgradeRequired: true
                }
            });
        }

        if (limitCheck.warning) {
            (req as any).usageWarning = {
                message: limitCheck.warning,
                level: limitCheck.warningLevel
            };
        }

        next();
    } catch (error) {
        logger.error({ error }, 'Error checking location limit');
        next();
    }
};

/**
 * Middleware to check user limits
 */
export const checkUserLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = (req as any).tenantId || (req as any).user?.tenant?.id;

        if (!tenantId) {
            return res.status(400).json({ message: 'Tenant ID required' });
        }

        const limitCheck = await usageService.checkLimits(tenantId, 'addUser');

        if (limitCheck.blocked) {
            return res.status(403).json({
                message: 'Límite de usuarios excedido',
                error: limitCheck.warning,
                details: {
                    currentCount: limitCheck.currentCount,
                    limit: limitCheck.limit,
                    hardLimit: limitCheck.hardLimit,
                    upgradeRequired: true
                }
            });
        }

        if (limitCheck.warning) {
            (req as any).usageWarning = {
                message: limitCheck.warning,
                level: limitCheck.warningLevel
            };
        }

        next();
    } catch (error) {
        logger.error({ error }, 'Error checking user limit');
        next();
    }
};
