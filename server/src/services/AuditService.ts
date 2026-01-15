import { EntityManager } from '@mikro-orm/core';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { Request } from 'express';

import { logger } from '../utils/logger';

export class AuditService {
    static async log(
        em: EntityManager,
        action: string, // Relaxing type to string to allow flexible actions
        entity: string,
        entityId: string,
        user: any, // Relaxed type to avoid TS issues with Partial<User> vs AuthRequest user
        details: any,
        req?: Request
    ) {
        try {
            // Safe extraction of IP and User Agent
            const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string : 'system';
            const userAgent = req ? req.headers['user-agent'] : 'system';

            // Context headers
            const tenantId = req?.headers?.['x-tenant-id'];
            const locationId = req?.headers?.['x-location-id'];

            let finalTenant = null;
            let finalLocation = null;

            if (tenantId) {
                finalTenant = await em.getReference('Tenant', tenantId);
            }

            if (locationId) {
                finalLocation = await em.getReference('Location', locationId);
            }

            const logEntry = em.create(AuditLog, {
                action: action as AuditAction,
                entity,
                entityId: entityId.toString(),
                userId: user?.id,
                username: user?.username || 'system',
                details: JSON.stringify(details),
                ipAddress,
                timestamp: new Date(),
                tenant: finalTenant,
                location: finalLocation
            });

            em.persist(logEntry);
            // We usually don't flush here if the transaction is ongoing, but for safety in catch blocks we might.
            // However, assuming this is called within a transaction scope (before commit).
            // If strictly audit, sometimes we want it to persist even if main fail? 
            // For now, standard persist.

        } catch (error) {
            logger.error({ error }, 'Failed to create audit log');
            // Don't throw, we don't want to break the main operation if logging fails
        }
    }
}
