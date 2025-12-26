import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Tenant, TenantStatus, TenantPlan } from '../../entities/Tenant';
import { SAAS_PLANS } from '../../config/saas.config';
import { AuditService } from '../../services/AuditService';

// Create new tenant
export const createTenant = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { name, slug, contactEmail, plan } = req.body;

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

        const selectedPlan = plan || TenantPlan.FREE;
        const planConfig = SAAS_PLANS[selectedPlan as TenantPlan] || SAAS_PLANS[TenantPlan.FREE];

        const tenant = em.create(Tenant, {
            name,
            slug,
            contactEmail,
            plan: selectedPlan,
            maxLocations: planConfig.maxLocations,
            maxUsers: planConfig.maxUsers,
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

export const getTenantById = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const tenant = await em.findOne(Tenant, { id }, {
            populate: ['locations', 'users'],
            filters: false
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        return res.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTenantStatus = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const { status } = req.body;

        const tenant = await em.findOne(Tenant, { id }, { filters: false });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        tenant.status = status;
        await em.persistAndFlush(tenant);

        await AuditService.log(
            em,
            'UPDATE_TENANT',
            'Tenant',
            tenant.id,
            (req as any).user,
            { status },
            req
        );

        return res.json(tenant);
    } catch (error) {
        console.error('Error updating tenant status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTenant = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const { name, contactEmail, plan } = req.body;

        const tenant = await em.findOne(Tenant, { id }, { filters: false });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        if (name) tenant.name = name;
        if (contactEmail) tenant.contactEmail = contactEmail;
        // Logic to change plan and update limits could be here, but for now just updating propery
        if (plan) {
            tenant.plan = plan;
            const planConfig = SAAS_PLANS[plan as TenantPlan];
            if (planConfig) {
                tenant.maxLocations = planConfig.maxLocations;
                tenant.maxUsers = planConfig.maxUsers;
            }
        }

        tenant.updatedAt = new Date();
        await em.persistAndFlush(tenant);

        await AuditService.log(
            em,
            'UPDATE_TENANT',
            'Tenant',
            tenant.id,
            (req as any).user,
            { name, contactEmail, plan },
            req
        );

        return res.json(tenant);
    } catch (error) {
        console.error('Error updating tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteTenant = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Database context missing' });

    try {
        const { id } = req.params;
        const tenant = await em.findOne(Tenant, { id }, { filters: false });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Logical delete (archive) or physical? Usually archive
        tenant.status = TenantStatus.ARCHIVED;
        await em.persistAndFlush(tenant);

        await AuditService.log(
            em,
            'DELETE_TENANT',
            'Tenant',
            tenant.id,
            (req as any).user,
            {},
            req
        );

        return res.json({ message: 'Tenant archived successfully' });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
