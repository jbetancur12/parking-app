import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Tenant, TenantStatus, TenantPlan } from '../../entities/Tenant';
import { Location } from '../../entities/Location';
import { User } from '../../entities/User';
import { AuditService } from '../../services/AuditService';

// Create new tenant
export const createTenant = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { name, slug, contactEmail, plan } = req.body;

        // ... validation ...
        if (!name || !slug) {
            return res.status(400).json({ message: 'Name and slug are required' });
        }

        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return res.status(400).json({
                message: 'Slug must be lowercase alphanumeric with hyphens only'
            });
        }

        const existing = await em.findOne(Tenant, { slug });
        if (existing) {
            return res.status(409).json({ message: 'Slug already exists' });
        }

        const tenant = em.create(Tenant, {
            name,
            slug,
            contactEmail,
            plan: plan || TenantPlan.FREE,
            status: TenantStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        await em.persistAndFlush(tenant);

        await AuditService.log(
            em,
            'CREATE_TENANT',
            'Tenant',
            tenant.id,
            (req as any).user,
            { name, slug, plan },
            req
        );

        return res.status(201).json(tenant);
    } catch (error) {
        console.error('Error creating tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ... getAllTenants ...

// Toggle Tenant Status (update logic needs to be found in file, but I'm just adding import and create log first)

// Get all tenants
export const getAllTenants = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { status } = req.query;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const tenants = await em.find(Tenant, where, {
            populate: ['locations', 'users'],
            filters: false // Disable filters to see counts correctly
        });

        // Map to include counts
        const tenantsWithCounts = tenants.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            contactEmail: t.contactEmail,
            plan: t.plan,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            locationsCount: t.locations.count(),
            usersCount: t.users.count(),
        }));

        return res.json(tenantsWithCounts);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get tenant by ID
export const getTenantById = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;

        const tenant = await em.findOne(Tenant, { id }, {
            populate: ['locations', 'users'],
            filters: false // Disable filters to see ALL locations for this tenant
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        return res.json({
            ...tenant,
            locations: tenant.locations.getItems(),
            users: tenant.users.getItems().map(u => ({
                id: u.id,
                username: u.username,
                role: u.role,
            })),
        });
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update tenant
export const updateTenant = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const { name, slug, contactEmail, plan } = req.body;

        const tenant = await em.findOne(Tenant, { id });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // If slug is changing, validate uniqueness
        if (slug && slug !== tenant.slug) {
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                return res.status(400).json({
                    message: 'Slug must be lowercase alphanumeric with hyphens only'
                });
            }

            const existing = await em.findOne(Tenant, { slug });
            if (existing) {
                return res.status(409).json({ message: 'Slug already exists' });
            }
            tenant.slug = slug;
        }

        if (name) tenant.name = name;
        if (contactEmail !== undefined) tenant.contactEmail = contactEmail;
        if (plan) tenant.plan = plan;

        await em.flush();

        await AuditService.log(
            em,
            'UPDATE_TENANT',
            'Tenant',
            tenant.id,
            (req as any).user,
            { name, slug, plan, contactEmail },
            req
        );

        return res.json(tenant);
    } catch (error) {
        console.error('Error updating tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update tenant status
export const updateTenantStatus = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !Object.values(TenantStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const tenant = await em.findOne(Tenant, { id });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const oldStatus = tenant.status;
        tenant.status = status;
        await em.flush();

        await AuditService.log(
            em,
            'UPDATE_TENANT_STATUS',
            'Tenant',
            tenant.id,
            (req as any).user,
            { oldStatus, newStatus: status },
            req
        );

        return res.json(tenant);
    } catch (error) {
        console.error('Error updating tenant status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
