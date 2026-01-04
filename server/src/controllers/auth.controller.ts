import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { User, UserRole } from '../entities/User';
import { Tenant, TenantPlan, TenantStatus } from '../entities/Tenant';
import { Location } from '../entities/Location';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { addDays } from 'date-fns';



export const registerTenant = async (req: Request, res: Response) => {
    // Validation now handled by middleware
    const { companyName, username, password, email } = req.body;

    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'No EM' });

    // 1. Check uniqueness
    const existingUser = await em.findOne(User, { username }, { filters: false });
    if (existingUser) return res.status(409).json({ message: 'Username already taken' });

    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existingTenant = await em.findOne(Tenant, { slug }, { filters: false });
    if (existingTenant) return res.status(409).json({ message: 'Company name already registered' });

    // 2. Create Tenant (Trial)
    const tenant = em.create(Tenant, {
        name: companyName,
        slug,
        plan: TenantPlan.TRIAL,
        status: TenantStatus.ACTIVE,
        contactEmail: email || '',
        trialEndsAt: addDays(new Date(), 14), // 14 Days Trial
        maxLocations: 1,
        maxUsers: 2,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    // 3. Create Default Location
    const location = em.create(Location, {
        name: 'Sede Principal',
        address: 'Dirección Principal',
        isActive: true,
        currentTicketNumber: 0,
        currentReceiptNumber: 0,
        tenant,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    // 4. Create Admin User
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = em.create(User, {
        username,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        tenants: [tenant],
        locations: [location],
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await em.persistAndFlush([tenant, location, user]);

    // Create trial subscription for new tenant
    try {
        const { SubscriptionService } = await import('../services/subscription.service');
        const subscriptionService = new SubscriptionService();
        await subscriptionService.createSubscription(tenant.id, 'trial');
        console.log(`✅ Trial subscription created for tenant ${tenant.id}`);
    } catch (error) {
        console.error('Failed to create subscription:', error);
        // Don't fail registration if subscription creation fails
    }

    // 5. Login immediately
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not defined');

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        secret,
        { expiresIn: '12h' }
    );

    return res.status(201).json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            tenants: [{
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                plan: tenant.plan,
                status: tenant.status,
                trialEndsAt: tenant.trialEndsAt
            }],
            locations: [{ id: location.id, name: location.name }],
            lastActiveLocation: null
        }
    });
};

export const login = async (req: Request, res: Response) => {
    // Validation now handled by middleware
    const { username, password } = req.body;

    const em = RequestContext.getEntityManager();
    if (!em) {
        return res.status(500).json({ message: 'Entity Manager not found' });
    }

    // Disable tenant filter for login as it is a global lookup (by username)
    // and User entity might be affected by relations or if we add loose filters.
    const user = await em.findOne(User, { username }, {
        populate: ['tenants', 'tenants.subscription', 'locations', 'lastActiveLocation'],
        filters: false // Disable all filters for this query to find the user globally
    });

    if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user has at least one active tenant
    const activeTenants = user.tenants.getItems().filter(t => t.isActive);
    if (activeTenants.length === 0) {
        return res.status(403).json({
            message: 'Cuenta suspendida. Contacte al administrador.',
            code: 'TENANT_SUSPENDED'
        });
    }

    // For non-super-admin users, check subscription status
    if (user.role !== UserRole.SUPER_ADMIN) {
        const primaryTenant = activeTenants[0];

        if (primaryTenant.subscription) {
            const { SubscriptionStatus } = await import('../entities/Subscription');

            if (primaryTenant.subscription.status === SubscriptionStatus.PAST_DUE) {
                return res.status(403).json({
                    message: 'Suscripcion vencida. Pague su factura pendiente.',
                    code: 'SUBSCRIPTION_PAST_DUE'
                });
            }
        }
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        secret,
        { expiresIn: '12h' }
    );

    // Determines available locations based on Role
    let availableLocations = user.locations.getItems();

    // If User is ADMIN (Tenant Owner), they should have access to ALL locations of their Tenant(s)
    // regardless of explicit assignment. "The Admin has keys to all rooms".
    if (user.role === UserRole.ADMIN && user.tenants.length > 0) {
        const tenantIds = user.tenants.getItems().map(t => t.id);
        const allTenantLocations = await em.find(Location, {
            tenant: { $in: tenantIds },
            isActive: true
        }, {
            filters: false
        });
        availableLocations = allTenantLocations;
    }

    return res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            tenants: user.tenants.getItems().map(t => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                plan: t.plan,
                status: t.status,
                trialEndsAt: t.trialEndsAt
            })), // Return available tenants
            locations: availableLocations.map(l => ({ id: l.id, name: l.name })), // Return available locations
            lastActiveLocation: user.lastActiveLocation ? { id: user.lastActiveLocation.id, name: user.lastActiveLocation.name } : null
        },
    });
};

export const setupStatus = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    const count = await em?.count(User);
    return res.json({ isConfigured: count && count > 0 });
};

export const setupAdmin = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    const count = await em?.count(User);

    if (count && count > 0) {
        return res.status(403).json({ message: 'System is already configured' });
    }

    // Validation now handled by middleware
    const { username, password } = req.body;

    // 1. Create Default Tenant
    const tenant = em?.create(Tenant, {
        name: 'Mi Parqueadero',
        slug: 'default-parking', // "default" might be reserved or too generic, but fine for desktop
        plan: 'enterprise', // Default to enterprise or similar for desktop
        status: 'active',
        contactEmail: '',
        createdAt: new Date(),
        updatedAt: new Date()
    } as any);

    if (tenant) await em?.persist(tenant);

    // 2. Create Default Location
    const location = em?.create(Location, {
        name: 'Sede Principal',
        address: 'Dirección Principal',
        isActive: true,
        currentTicketNumber: 0,
        currentReceiptNumber: 0,
        tenant: tenant, // Link to tenant
        createdAt: new Date(),
        updatedAt: new Date()
    } as any);

    if (location) await em?.persist(location);

    // 3. Create First Admin User (Owner of this Tenant)
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = em?.create(User, {
        username,
        password: hashedPassword,
        role: UserRole.ADMIN, // Default to ADMIN for Desktop/Single-Tenant
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    if (admin) {
        if (tenant) admin.tenants.add(tenant); // Assign to tenant
        if (location) admin.locations.add(location); // Assign to location

        await em?.persistAndFlush(admin);
        return res.json({ message: 'Admin and Default Environment created successfully' });
    } else {
        return res.status(500).json({ message: 'Error creating configuration' });
    }
};
