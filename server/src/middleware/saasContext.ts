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


    // NEW: If user is authenticated and has locations assigned
    const authReq = req as AuthRequest;
    if (authReq.user) {
        try {
            const user = await em.findOne(User, { id: authReq.user.id }, { populate: ['locations'], filters: false });

            // If locationId provided in header, verify user has access to it (unless Admin/SuperAdmin)
            if (locationId) {
                if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN) {
                    const hasAccess = user?.locations.getItems().some(l => l.id === locationId);
                    if (!hasAccess) {
                        console.warn(`[SaaS Context] User ${user?.username} attempted to access unauthorized location ${locationId}`);
                        // We could block here, but for now we just won't apply the filter/context which might result in empty data or 403 later
                        locationId = '';
                    }
                }
            } else {
                // No location header provided. 
                // If user is OPERATOR/CASHIER and has exactly one location, force it.
                if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.SUPER_ADMIN) {
                    const locations = user?.locations.getItems() || [];
                    if (locations.length === 1) {
                        locationId = locations[0].id;
                        req.location = locations[0];
                        console.log(`[SaaS Context] Auto-applying single assigned location for ${user?.username}: ${locations[0].name}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading user locations:', error);
        }
    }

    // Apply default filter if tenant is present
    if (tenantId) {
        em.setFilterParams('tenant', { tenantId });
    } else {
        // Strict Isolation: If no tenant header is present (e.g. Login, Global Admin, Public Routes),
        // we normally want to enforce strictness and return NOTHING.
        // However, for Auth (Login), we need to check if the entity (User) has the filter enabled.
        // The 'tenant' filter is defined on BaseTenantEntity. User might NOT be extending BaseTenantEntity directly, 
        // but if it has relations to it, it might trigger.
        // To be safe and strict: We set a dummy tenant ID so the filter returns nothing by default 
        // unless the controller explicitly disables the filter.
        em.setFilterParams('tenant', { tenantId: '00000000-0000-0000-0000-000000000000' });
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

                // Trial Expiration Check
                if (tenant.plan === 'trial' && tenant.trialEndsAt) {
                    const now = new Date();
                    const trialEnd = new Date(tenant.trialEndsAt);

                    console.log(`[Trial Check] Tenant: ${tenant.name}, Plan: ${tenant.plan}, Ends: ${trialEnd.toISOString()}, Now: ${now.toISOString()}`);

                    // Block if expired AND NOT SuperAdmin
                    if (now > trialEnd && authReq.user?.role !== UserRole.SUPER_ADMIN) {
                        console.log('BLOCKED: Trial Expired');
                        return res.status(403).json({
                            message: 'Tu periodo de prueba ha finalizado. Por favor actualiza tu plan para continuar.',
                            code: 'TRIAL_EXPIRED'
                        });
                    }
                }

                // Check if tenant is active
                if (tenant.status !== 'active') {
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
