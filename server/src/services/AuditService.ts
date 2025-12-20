import { EntityManager } from '@mikro-orm/core';
import { AuditLog } from '../entities/AuditLog';

export class AuditService {
    static async logAction(
        em: EntityManager,
        user: { id: number; username: string } | undefined,
        action: string,
        entity: string,
        entityId?: string,
        details?: any
    ) {
        try {
            const log = em.create(AuditLog, {
                action,
                entity,
                entityId: entityId ? String(entityId) : undefined,
                userId: user?.id,
                username: user?.username || 'System',
                details: details ? JSON.stringify(details) : undefined,
                timestamp: new Date()
            });
            em.persist(log);
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw, we don't want to break the main flow if logging fails
        }
    }
}
