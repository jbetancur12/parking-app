import { EntityManager } from '@mikro-orm/core';
import { AuditLog } from '../entities/AuditLog';
import { User } from '../entities/User';

export class AuditService {
    static async log(
        em: EntityManager,
        action: string,
        entity: string,
        entityId: string | number,
        user: User,
        details: any,
        req?: any
    ) {
        try {
            const audit = em.create(AuditLog, {
                action,
                entity,
                entityId: String(entityId),
                userId: user.id,
                username: user.username,
                details: JSON.stringify(details),
                ipAddress: req?.ip || req?.socket?.remoteAddress,
                timestamp: new Date(),
                tenant: user.tenants[0], // Fallback if no context
                location: (req as any)?.location // From SaaS context
            });

            // If we have a robust SaaS context
            if ((req as any)?.tenant) {
                audit.tenant = (req as any).tenant;
            }

            await em.persistAndFlush(audit);
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw, we don't want to break the main transaction just because logging failed
        }
    }
}
