import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Location } from '../entities/Location';

// Assign user to locations
export const assignUserToLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId } = req.params;
        const { locationIds } = req.body; // Expect array of IDs or empty array

        const user = await em.findOne(User, { id: parseInt(userId) }, { populate: ['tenants', 'locations'] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (locationIds && Array.isArray(locationIds)) {
            // Clear existing locations
            user.locations.removeAll();

            if (locationIds.length > 0) {
                const locations = await em.find(Location, { id: { $in: locationIds } }, { populate: ['tenant'] });

                // Verify all locations belong to valid tenants for this user
                // (Ideally we check if user belongs to the tenant of the location)
                // For now, we assume if the admin has access to assign, it's valid, 
                // OR we strictly check against user.tenants
                const validLocations = locations.filter(loc =>
                    user.tenants.getItems().some(t => t.id === loc.tenant.id)
                );

                user.locations.set(validLocations);
            }
        }

        await em.flush();

        return res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            locations: user.locations.getItems().map(l => ({
                id: l.id,
                name: l.name
            }))
        });
    } catch (error) {
        console.error('Error assigning user to locations:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's assigned locations
export const getUserLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId } = req.params;

        const user = await em.findOne(User, { id: parseInt(userId) }, { populate: ['locations'] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            locations: user.locations.getItems().map(l => ({
                id: l.id,
                name: l.name
            }))
        });
    } catch (error) {
        console.error('Error fetching user location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
