import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Location } from '../../entities/Location';
import { Tenant } from '../../entities/Tenant';

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

        return res.status(201).json(location);
    } catch (error) {
        console.error('Error creating location:', error);
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

        const locations = await em.find(Location, where, {
            populate: ['tenant'],
        });

        return res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
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

        return res.json(location);
    } catch (error) {
        console.error('Error fetching location:', error);
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
        console.error('Error updating location:', error);
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
        console.error('Error deleting location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
