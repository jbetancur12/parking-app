import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { User, UserRole } from '../entities/User';
import { Tenant, TenantPlan, TenantStatus } from '../entities/Tenant';
import { Location } from '../entities/Location';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { addDays } from 'date-fns';
import { SettingsInitService } from '../services/SettingsInitService';
import crypto from 'crypto';



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
    } as any);

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
        updatedAt: new Date(),
        tokenVersion: 0
    });

    await em.persistAndFlush([tenant, location, user]);

    // Create default settings for the new tenant and location
    try {
        await SettingsInitService.createDefaultSettings(em, tenant.id, location.id);
    } catch (error) {
        console.error('Failed to create default settings:', error);
        // Don't fail registration if settings creation fails
    }

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
        {
            id: user.id,
            username: user.username,
            role: user.role,
            tenant: { id: tenant.id, plan: tenant.plan }
        },
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
        populate: ['tenants', 'tenants.subscriptions', 'tenants.pricingPlan', 'locations', 'lastActiveLocation'],
        filters: false // Disable all filters for this query to find the user globally
    });

    if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login timestamp for activity tracking
    user.lastLoginAt = new Date();
    await em.flush();

    // Check if user has at least one active tenant
    // Check if user has at least one active tenant
    // @ts-ignore - isActive exists on Tenant at runtime
    const activeTenants = user.tenants.getItems().filter(t => t.isActive);

    // Only block if NOT super admin AND no active tenants
    if (activeTenants.length === 0 && user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({
            message: 'Cuenta suspendida. Contacte al administrador.',
            code: 'TENANT_SUSPENDED'
        });
    }

    // For non-super-admin users, check subscription status
    if (user.role !== UserRole.SUPER_ADMIN) {
        const primaryTenant = activeTenants[0];

        // Find latest subscription
        const subscriptions = primaryTenant.subscriptions.getItems();

        if (subscriptions.length > 0) {
            // Sort by createdAt desc to get latest
            const latestSubscription = subscriptions.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];

            const { SubscriptionStatus } = await import('../entities/Subscription');

            if (latestSubscription.status === SubscriptionStatus.PAST_DUE) {
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

    // Determine primary tenant for token context
    // @ts-ignore
    const primaryTenant = activeTenants.length > 0 ? activeTenants[0] : null;

    const tokenPayload: any = {
        id: user.id,
        username: user.username,
        role: user.role,
        tokenVersion: user.tokenVersion // Security: Global Logout Support
    };

    if (primaryTenant) {
        tokenPayload.tenant = {
            id: primaryTenant.id,
            plan: primaryTenant.plan
        };
    }

    const token = jwt.sign(
        tokenPayload,
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
                trialEndsAt: t.trialEndsAt,
                pricingPlan: t.pricingPlan ? {
                    code: t.pricingPlan.code,
                    name: t.pricingPlan.name,
                    featureFlags: t.pricingPlan.featureFlags
                } : undefined
            })), // Return available tenants
            locations: availableLocations.map(l => ({ id: l.id, name: l.name })), // Return available locations
            lastActiveLocation: user.lastActiveLocation ? { id: user.lastActiveLocation.id, name: user.lastActiveLocation.name } : null
        },
    });
};

export const impersonateTenant = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.body;
        const em = RequestContext.getEntityManager();
        if (!em) return res.status(500).json({ message: 'No EntityManager available' });

        // 1. Verify Requestor is Super Admin
        const userRequesting = (req as any).user;
        if (!userRequesting) {
            return res.status(500).json({ message: 'User context missing despite middleware' });
        }

        console.log('Impersonation requested by:', userRequesting.username, 'Role:', userRequesting.role);

        if (userRequesting.role !== 'SUPER_ADMIN' && userRequesting.role !== 'super_admin') {
            return res.status(403).json({ message: 'Only Super Admin can impersonate' });
        }

        // 2. Find target tenant
        const tenant = await em.findOne(Tenant, { id: tenantId }, {
            populate: ['pricingPlan'],
            filters: false
        });
        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        // 3. Find a user to impersonate
        // If targetUserId is provided, use that. Otherwise find an ADMIN.
        const { targetUserId } = req.body;
        let targetUser;

        if (targetUserId) {
            targetUser = await em.findOne(User, {
                id: targetUserId,
                tenants: { id: tenantId } // Ensure user belongs to this tenant
            }, {
                populate: ['tenants', 'tenants.subscriptions', 'locations', 'lastActiveLocation'],
                filters: false
            });
        } else {
            // Fallback: Find any ADMIN
            targetUser = await em.findOne(User, {
                tenants: { id: tenantId },
                role: UserRole.ADMIN
            }, {
                populate: ['tenants', 'tenants.subscriptions', 'locations', 'lastActiveLocation'],
                filters: false
            });
        }

        if (!targetUser) {
            // Fallback: Try to find ANY admin for this tenant?
            // Or maybe the role is different?
            return res.status(404).json({ message: 'No admin user found for this tenant to impersonate' });
        }

        // 4. Generate Token for Target User
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined');

        // Similar logic to login
        const tokenPayload: any = {
            id: targetUser.id,
            username: targetUser.username,
            role: targetUser.role,
            tokenVersion: targetUser.tokenVersion // Security: Global Logout Support
        };

        // Add tenant context to token if possible, mirroring login
        if (targetUser.tenants.length > 0) {
            tokenPayload.tenant = {
                id: tenant.id, // Use the specific tenant we are impersonating
                plan: tenant.plan
            };
        }

        // Add impersonation flag
        tokenPayload.impersonatedBy = userRequesting.id;

        const token = jwt.sign(
            tokenPayload,
            secret,
            { expiresIn: '1h' } // Short lived token for impersonation
        );

        // Determines available locations
        let availableLocations = targetUser.locations.getItems();

        // If target is Admin, give them all locations for this tenant
        if (targetUser.role === UserRole.ADMIN) {
            const allTenantLocations = await em.find(Location, {
                tenant: tenant.id,
                isActive: true
            }, {
                filters: false
            });
            if (allTenantLocations.length > 0) {
                availableLocations = allTenantLocations;
            }
        }

        return res.json({
            token,
            user: {
                id: targetUser.id,
                username: targetUser.username,
                role: targetUser.role,
                tenants: [{
                    id: tenant.id,
                    name: tenant.name,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    status: tenant.status,
                    trialEndsAt: tenant.trialEndsAt,
                    pricingPlan: tenant.pricingPlan ? {
                        code: tenant.pricingPlan.code,
                        name: tenant.pricingPlan.name,
                        featureFlags: tenant.pricingPlan.featureFlags
                    } : undefined
                }],
                locations: availableLocations.map(l => ({ id: l.id, name: l.name })),
                lastActiveLocation: null
            }
        });
    } catch (error: any) {
        console.error('Impersonation Handler Error:', error);
        return res.status(500).json({
            message: 'Internal Server Error during Impersonation',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
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
        updatedAt: new Date(),
        tokenVersion: 0
    });

    if (admin) {
        if (tenant) admin.tenants.add(tenant); // Assign to tenant
        if (location) admin.locations.add(location); // Assign to location

        await em?.persistAndFlush(admin);

        // Create default settings for the new tenant and location
        try {
            if (em && tenant && location) {
                await SettingsInitService.createDefaultSettings(em, tenant.id, location.id);
            }
        } catch (error) {
            console.error('Failed to create default settings:', error);
            // Don't fail setup if settings creation fails
        }

        return res.json({ message: 'Admin and Default Environment created successfully' });
    } else {
        return res.status(500).json({ message: 'Error creating configuration' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const em = RequestContext.getEntityManager();
        if (!em) return res.status(500).json({ message: 'No EntityManager' });

        // Disable filters to find user globally by email
        const user = await em.findOne(User, { username: email }, { filters: false });
        if (!user) {
            // Security: Don't reveal if user exists
            return res.json({ message: 'If the email exists, a reset link has been sent.' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = addDays(new Date(), 1); // 24 hours (or 1 hour)

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        await em.flush();

        // Send Email
        const { EmailService } = await import('../services/email.service');
        const emailService = new EmailService();
        await emailService.sendPasswordResetEmail(user.username, resetToken);

        res.json({ message: 'If the email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        const em = RequestContext.getEntityManager();
        if (!em) return res.status(500).json({ message: 'No EntityManager' });

        // DEBUGGING: Check what we received
        console.log('Reset Password Request - Token:', token);

        // 1. Try to find user JUST by token - DISABLE FILTERS
        const userByToken = await em.findOne(User, { resetPasswordToken: token }, { filters: false });
        if (!userByToken) {
            console.error('Debug: No user found with this token.');
            return res.status(400).json({ message: 'Invalid or expired token (Token not found)' });
        }

        console.log('Debug: User found:', userByToken.username);
        console.log('Debug: Expiry stored:', userByToken.resetPasswordExpires);
        console.log('Debug: Current server time:', new Date());

        // 2. Now check expiration manually to be verbose
        if (!userByToken.resetPasswordExpires || userByToken.resetPasswordExpires < new Date()) {
            console.error('Debug: Token expired.');
            return res.status(400).json({ message: 'Invalid or expired token (Expired)' });
        }

        const user = userByToken;

        /* Original logic replaced by verbose check above
        const user = await em.findOne(User, {
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() } // Expires > Now
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        */

        // Update Password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        if (!user.isActive) user.isActive = true;

        // Security: Invalidate all existing sessions
        user.tokenVersion = (user.tokenVersion || 0) + 1;

        await em.flush();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
