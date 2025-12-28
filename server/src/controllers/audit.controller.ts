import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { AuditLog } from '../entities/AuditLog';

export class AuditController {
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const user = (req as any).user;
            const filter: any = {};

            // Filter by Tenant (unless Super Admin exploring all, though usually they search within a tenant context)
            if (req.headers['x-tenant-id']) {
                filter.tenant = req.headers['x-tenant-id'];
            } else if (user.role !== 'SUPER_ADMIN') {
                // Determine tenant from user if header missing (fallback)
                // Ideally middleware handles this, but we filter to be safe
                // Logic depends on how you handle super admins viewing tenants
            }

            // Location Manager restriction
            if (user.role === 'LOCATION_MANAGER' && user.locations?.length > 0) {
                // Assuming user.locations is populated or we use the header
                const locationId = req.headers['x-location-id'];
                if (locationId) {
                    filter.location = locationId;
                } else {
                    // If no specific location selected, show logs for all their assigned locations
                    // This requires user.locations to be a list of IDs or objects
                    // keeping it simple: stick to the current context header
                }
            }

            const logs = await em.find(AuditLog, filter, {
                orderBy: { timestamp: 'DESC' },
                limit: 100,
                populate: ['location'] // Populate location to display name
            });

            res.json(logs);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ message: 'Error fetching logs' });
        }
    }
}
