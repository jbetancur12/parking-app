import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Tenant } from '../entities/Tenant';
import { Location } from '../entities/Location';
import { User, UserRole } from '../entities/User';
import { AuthRequest } from './auth.middleware';

// Extend Express Request type to include tenant and location
declare global {
    namespace Express {
        interface Request {
            tenant?: Tenant;
            location?: Location;
        }
    }
}

export const saasContext = async (req: Request, res: Response, next: NextFunction) => {
    const em = RequestContext.getEntityManager();
    if (!em) {
        return next();
    }

    const tenantId = req.headers['x-tenant-id'] as string;
    let locationId = req.headers['x-location-id'] as string;

    // NEW: If user is authenticated and has a location assigned, use it automatically
    // (unless they're ADMIN or SUPER_ADMIN who can see all locations)
    const authReq = req as AuthRequest;
    if (authReq.user && !locationId) {
        try {
            const user = await em.findOne(User, { id: authReq.user.id }, { populate: ['location'] });
            if (user?.location && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
                // Operator/Cashier with assigned location: force filter
                locationId = user.location.id;
                req.location = user.location;
                console.log(`[SaaS Context] Auto-applying location filter for ${user.username}: ${user.location.name}`);
            }
        } catch (error) {
            console.error('Error loading user location:', error);
        }
    }

    // Apply default filter if tenant is present
    if (tenantId) {
        em.setFilterParams('tenant', { tenantId });
    } else {
        // If no tenant is present (e.g. SuperAdmin dashboard or login), we might want to disable the filter manually
        // or just assume the filter returns empty or all (config dependent).
        // Here, passing empty args to filter returns {}, effectively "all".
        // But typically for SaaS we want strict isolation.
        // Strategy: If public route, it manages itself. If protected route, auth middleware enforces tenant.
        em.setFilterParams('tenant', {});
    }

    if (locationId) {
        em.setFilterParams('location', { locationId });
        // We might want to enable location filter explicitly if it defaults to false
        // em.enableFilter('location');  <-- This depends if we want strict location isolation or just context
    }

    // Skip for public routes (like login or health check) if needed, 
    // but for now we just try to resolve if headers are present.

    if (tenantId) {
        try {
            const tenant = await em.findOne(Tenant, { id: tenantId });
            if (tenant) {
                req.tenant = tenant;
                // Check if tenant is active
                if (tenant.status !== 'active') { // Assuming 'status' is a string enum in runtime
                    // We might want to block suspended tenants here
                }
            }
        } catch (error) {
            console.error('Error loading tenant context:', error);
        }
    }

    if (locationId && !req.location) {
        // Only load from header if not already loaded from user
        try {
            const location = await em.findOne(Location, { id: locationId });
            if (location) {
                // Security check: Location must belong to the tenant
                if (req.tenant && location.tenant.id !== req.tenant.id) {
                    console.warn(`Security Warning: Mismatch location ${locationId} for tenant ${tenantId}`);
                    // We don't set req.location to prevent unauthorized access
                } else {
                    req.location = location;
                }
            }
        } catch (error) {
            console.error('Error loading location context:', error);
        }
    }

    next();
};
