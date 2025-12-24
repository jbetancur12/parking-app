import { RequestContext } from '@mikro-orm/core';
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { User, UserRole } from '../entities/User';

export const requireRole = (allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
};

export const verifyTenantAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // If no context, skip check (or enforce if strict SaaS)
    if (!req.tenant) {
        return next();
    }

    // Require authentication
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required for tenant access' });
    }

    // SuperAdmin bypass
    if (req.user.role === UserRole.SUPER_ADMIN) {
        return next();
    }

    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        // Load user with permissions
        // We load 'tenants' to check if user belongs to the requested tenant
        // We load 'location' (if any) to check if user is restricted to a specific location
        const user = await em.findOne(User, { id: req.user.id }, { populate: ['tenants', 'location'] });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // 1. Verify Tenant Access
        // Check if the requested tenant is in the user's allowed tenants list
        const hasTenantAccess = user.tenants.getItems().some(t => t.id === req.tenant!.id);

        if (!hasTenantAccess) {
            return res.status(403).json({ message: `Access to tenant '${req.tenant.name}' is denied` });
        }

        // 2. Verify Location Access (if request relies on a specific location)
        if (req.location) {
            // If user is restricted to a location (e.g. Cashier assigned to a Sede), they must match
            if (user.location && user.location.id !== req.location.id) {
                return res.status(403).json({ message: `Access to location '${req.location.name}' is restricted for your user` });
            }
        }

        next();
    } catch (error) {
        console.error('Error verifying tenant access:', error);
        return res.status(500).json({ message: 'Internal Server Error during permission check' });
    }
};
