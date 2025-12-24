import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { User } from '../../entities/User';
import { Tenant } from '../../entities/Tenant';

// Assign user to tenant(s)
export const assignUserToTenants = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId } = req.params;
        const { tenantIds } = req.body;

        if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
            return res.status(400).json({ message: 'tenantIds array is required' });
        }

        const user = await em.findOne(User, { id: parseInt(userId) }, {
            populate: ['tenants'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify all tenants exist
        const tenants = await em.find(Tenant, { id: { $in: tenantIds } });
        if (tenants.length !== tenantIds.length) {
            return res.status(404).json({ message: 'One or more tenants not found' });
        }

        // Add tenants to user (ManyToMany will handle duplicates)
        tenants.forEach(tenant => {
            user.tenants.add(tenant);
        });

        await em.flush();

        return res.json({
            message: 'User assigned to tenants successfully',
            tenants: user.tenants.getItems().map(t => ({ id: t.id, name: t.name, slug: t.slug }))
        });
    } catch (error) {
        console.error('Error assigning user to tenants:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's tenants
export const getUserTenants = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId } = req.params;

        const user = await em.findOne(User, { id: parseInt(userId) }, {
            populate: ['tenants'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
            tenants: user.tenants.getItems().map(t => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                plan: t.plan,
                status: t.status,
            })),
        });
    } catch (error) {
        console.error('Error fetching user tenants:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove user from tenant
export const removeUserFromTenant = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { userId, tenantId } = req.params;

        const user = await em.findOne(User, { id: parseInt(userId) }, {
            populate: ['tenants'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tenant = await em.findOne(Tenant, { id: tenantId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        user.tenants.remove(tenant);
        await em.flush();

        return res.json({ message: 'User removed from tenant successfully' });
    } catch (error) {
        console.error('Error removing user from tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
