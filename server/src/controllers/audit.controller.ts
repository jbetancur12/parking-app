import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { AuditLog } from '../entities/AuditLog';

export class AuditController {
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const logs = await em.find(AuditLog, {}, {
                orderBy: { timestamp: 'DESC' },
                limit: 100 // Limit to last 100 for now
            });

            res.json(logs);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ message: 'Error fetching logs' });
        }
    }
}
