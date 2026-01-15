import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ErrorLog } from '../entities/ErrorLog';
import { Tenant } from '../entities/Tenant';
import { User } from '../entities/User';
import { logger } from '../utils/logger';

import { EmailService } from '../services/email.service';

/**
 * POST /api/error-logs
 * Create a new error log entry (public endpoint, no auth required)
 */
export const createErrorLog = async (req: Request, res: Response) => {
    try {
        const em = RequestContext.getEntityManager();
        if (!em) {
            logger.error('Failed to get entity manager');
            return res.status(500).json({ message: 'Database connection failed' });
        }

        const {
            errorMessage,
            errorStack,
            componentStack,
            userAgent,
            url,
            tenantId,
            userId
        } = req.body;

        if (!errorMessage) {
            return res.status(400).json({ message: 'errorMessage is required' });
        }

        const errorLog = new ErrorLog({
            errorMessage,
            errorStack,
            componentStack,
            userAgent,
            url
        });

        // Optionally link to tenant/user if authenticated
        if (tenantId) {
            const tenant = await em.findOne(Tenant, { id: tenantId }, { filters: false });
            if (tenant) errorLog.tenant = tenant;
        }

        if (userId) {
            const user = await em.findOne(User, { id: userId }, { filters: false });
            if (user) errorLog.user = user;
        }

        await em.persist(errorLog).flush();

        // Send email alert asynchronously (fire and forget)
        const emailService = new EmailService();
        emailService.sendErrorAlert({
            errorMessage: errorLog.errorMessage,
            errorStack: errorLog.errorStack,
            tenantName: errorLog.tenant?.name,
            username: errorLog.user?.username,
            url: errorLog.url,
            timestamp: errorLog.timestamp
        });

        return res.status(201).json({
            message: 'Error logged successfully',
            id: errorLog.id
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to log error');
        return res.status(500).json({ message: 'Failed to log error' });
    }
};

/**
 * GET /api/error-logs
 * Get all error logs (Super Admin only)
 */
export const getErrorLogs = async (req: Request, res: Response) => {
    try {
        const em = RequestContext.getEntityManager();
        if (!em) {
            return res.status(500).json({ message: 'Database connection failed' });
        }

        const { resolved, limit = 50, offset = 0 } = req.query;

        const where: any = {};
        if (resolved !== undefined) {
            where.resolved = resolved === 'true';
        }

        const [errorLogs, total] = await em.findAndCount(
            ErrorLog,
            where,
            {
                populate: ['tenant', 'user'],
                orderBy: { timestamp: 'DESC' },
                limit: Number(limit),
                offset: Number(offset),
                filters: { tenant: false } // Disable tenant filter to allow super admin to see all logs
            }
        );

        return res.json({
            errorLogs,
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to fetch error logs');
        return res.status(500).json({ message: 'Failed to fetch error logs' });
    }
};

/**
 * PATCH /api/error-logs/:id/resolve
 * Mark an error as resolved (Super Admin only)
 */
export const resolveErrorLog = async (req: Request, res: Response) => {
    try {
        const em = RequestContext.getEntityManager();
        if (!em) {
            return res.status(500).json({ message: 'Database connection failed' });
        }

        const { id } = req.params;
        const user = (req as any).user;

        const errorLog = await em.findOne(ErrorLog, { id });

        if (!errorLog) {
            return res.status(404).json({ message: 'Error log not found' });
        }

        errorLog.resolved = true;
        errorLog.resolvedBy = user?.username || 'Unknown';
        errorLog.resolvedAt = new Date();

        await em.flush();

        return res.json({
            message: 'Error marked as resolved',
            errorLog
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to resolve error log');
        return res.status(500).json({ message: 'Failed to resolve error log' });
    }
};
