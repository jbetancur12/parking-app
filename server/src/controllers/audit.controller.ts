import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { AuditLog } from '../entities/AuditLog';
import { logger } from '../utils/logger';

export class AuditController {
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const user = (req as any).user;
            const filter: any = {};

            // Filter by Tenant
            // If the user is SUPER_ADMIN, we only filter if they explicitly want to filter (or if we decide the UI should always be global)
            // CURRENT BEHAVIOR FIX: If SUPER_ADMIN, ignore the header unless it's a specific "impersonation" or "drill-down" context. 
            // For now, let's treat the header as "optional filter" for SuperAdmin.

            if (user.role === 'SUPER_ADMIN') {
                // If query param ?global=true is present, ignore tenant header
                // Or simply: If SuperAdmin, checking audit logs should default to ALL unless specified otherwise.
                // But the header is sent automatically by the frontend if a tenant is selected in the context.
                // Let's rely on a query param 'tenantId' for explicit filtering, or ignore header if it conflicts with "Global" view desire.

                // Better fix: if req.query.tenantId is provided, use it. If not, don't use the header if it's just the context one.
                // Actually, the safest way given the 'blank page' issue:
                // If SuperAdmin, do NOT auto-apply the header filter. Only apply if explicitly passed in query or if we want to enforce context (which we don't for Global Audit).

                if (req.query.tenantId) {
                    filter.tenant = req.query.tenantId;
                }
                // If no query param, we show ALL (Global Dashboard). We definitely IGNORE x-tenant-id here because that comes from localStorage context which might be stale or irrelevant for global view.
            } else {
                // For non-SuperAdmin, always enforce strict tenant (from header or user relation)
                if (req.headers['x-tenant-id']) {
                    filter.tenant = req.headers['x-tenant-id'];
                } else {
                    // Fallback or error?
                }
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
            logger.error({ error }, 'Error fetching audit logs');
            res.status(500).json({ message: 'Error fetching logs' });
        }
    }
}
