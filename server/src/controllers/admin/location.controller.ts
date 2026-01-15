import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Location } from '../../entities/Location';
import { Tenant } from '../../entities/Tenant';
import { AuditService } from '../../services/AuditService';
import { User } from '../../entities/User';
import { logger } from '../../utils/logger';

// Create new location
export const createLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { tenantId, name, address, phone, settings } = req.body;

        if (!tenantId || !name) {
            return res.status(400).json({ message: 'Tenant ID and name are required' });
        }

        // Verify tenant exists
        const tenant = await em.findOne(Tenant, { id: tenantId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // ... (Limit check omitted for brevity in diff, keep usage) ...
        const currentLocationsCount = await em.count(Location, { tenant });
        if (currentLocationsCount >= tenant.maxLocations) {
            return res.status(403).json({
                message: `Límite de sedes alcanzado (${tenant.maxLocations}). Actualiza tu plan para agregar más sedes.`
            });
        }

        const location = em.create(Location, {
            tenant,
            name,
            address,
            phone,
            settings: settings || {},
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        await em.persistAndFlush(location);

        await AuditService.log(
            em,
            'CREATE_LOCATION',
            'Location',
            location.id,
            (req as any).user,
            { name, tenantId, address },
            req
        );

        return res.status(201).json(location);
    } catch (error) {
        logger.error({ error }, 'Error creating location:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all locations (with optional tenant filter)
export const getAllLocations = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const authReq = req as any; // Cast to access user and tenant
        const userRole = authReq.user?.role;
        const currentTenantId = authReq.tenant?.id;

        // query param for SuperAdmin
        const { tenantId } = req.query;

        const where: any = {};

        // Security: If not Super Admin, FORCE tenant filter
        if (userRole !== 'SUPER_ADMIN') {
            if (!currentTenantId) {
                return res.status(403).json({ message: 'Tenant context required' });
            }
            where.tenant = currentTenantId;
        } else if (tenantId) {
            // If Super Admin and tenantId query param provided
            where.tenant = tenantId;
        }

        // If LOCATION_MANAGER, restrict to assigned locations
        if (userRole === 'LOCATION_MANAGER') {
            const user = await em.findOne(User, { id: authReq.user.id }, { populate: ['locations'] });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const locationIds = user.locations.getItems().map((l: Location) => l.id);
            if (locationIds.length === 0) {
                // No locations assigned, return empty list
                return res.json([]);
            }
            where.id = { $in: locationIds };
        }

        const locations = await em.find(Location, where, {
            populate: ['tenant'],
            filters: userRole === 'SUPER_ADMIN' ? false : undefined
        });

        return res.json(locations);
    } catch (error) {
        logger.error({ error }, 'Error fetching locations:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get location by ID
export const getLocationById = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;

        const location = await em.findOne(Location, { id }, {
            populate: ['tenant'],
        });

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Check if LOCATION_MANAGER has access
        const authReq = req as any;
        if (authReq.user?.role === 'LOCATION_MANAGER') {
            const user = await em.findOne(User, { id: authReq.user.id }, { populate: ['locations'] });
            const hasAccess = user?.locations.getItems().some((l: Location) => l.id === location.id);
            if (!hasAccess) {
                return res.status(403).json({ message: 'Forbidden: You do not have access to this location' });
            }
        }

        return res.json(location);
    } catch (error) {
        logger.error({ error }, 'Error fetching location:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update location
export const updateLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const { name, address, phone, settings, isActive } = req.body;

        const location = await em.findOne(Location, { id });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (name) location.name = name;
        if (address !== undefined) location.address = address;
        if (phone !== undefined) location.phone = phone;
        if (settings) location.settings = settings;
        if (isActive !== undefined) location.isActive = isActive;

        await em.flush();

        return res.json(location);
    } catch (error) {
        logger.error({ error }, 'Error updating location:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete location
export const deleteLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;

        const location = await em.findOne(Location, { id });
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // TODO: Add check for existing data (sessions, transactions, etc.)
        // For now, we'll do a soft delete by setting isActive = false
        location.isActive = false;
        await em.flush();

        return res.json({ message: 'Location deactivated successfully' });
    } catch (error) {
        logger.error({ error }, 'Error deleting location:');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
