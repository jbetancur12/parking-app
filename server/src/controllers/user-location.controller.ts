import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Location } from '../entities/Location';

// Assign user to location
export const assignUserToLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId } = req.params;
        const { locationId } = req.body;

        const user = await em.findOne(User, { id: parseInt(userId) }, { populate: ['tenants'] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (locationId) {
            const location = await em.findOne(Location, { id: locationId }, { populate: ['tenant'] });
            if (!location) {
                return res.status(404).json({ message: 'Location not found' });
            }

            // Verify user has access to the tenant of this location
            const hasAccess = user.tenants.getItems().some(t => t.id === location.tenant.id);
            if (!hasAccess) {
                return res.status(403).json({
                    message: 'User does not have access to this location\'s tenant'
                });
            }

            user.location = location;
        } else {
            // Unassign location (allow access to all locations of their tenants)
            user.location = undefined;
        }

        await em.flush();

        return res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            location: user.location ? {
                id: user.location.id,
                name: user.location.name
            } : null
        });
    } catch (error) {
        console.error('Error assigning user to location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's assigned location
export const getUserLocation = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId } = req.params;

        const user = await em.findOne(User, { id: parseInt(userId) }, { populate: ['location'] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            location: user.location ? {
                id: user.location.id,
                name: user.location.name
            } : null
        });
    } catch (error) {
        console.error('Error fetching user location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
