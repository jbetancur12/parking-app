import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { User, UserRole } from '../entities/User';
import { Tenant } from '../entities/Tenant';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuditService } from '../services/AuditService';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import crypto from 'crypto';

import { Location } from '../entities/Location';

export class UserController {
    // Get all users (filtered by tenant for non-SUPER_ADMIN)
    async getAll(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            // Get current user's tenant context from request (set by saasContext middleware)
            const currentTenantId = (req as any).tenant?.id;
            const search = req.query.search as string;

            let users;
            const filters: any = {};

            // Search filter
            if (search) {
                filters.username = { $like: `%${search}%` };
            }

            // SUPER_ADMIN can see all users, others only see users from their tenant
            if (req.user?.role === UserRole.SUPER_ADMIN) {
                // Exclude SUPER_ADMIN users from the list (they manage themselves separately)
                filters.role = { $ne: UserRole.SUPER_ADMIN };

                users = await em.find(User, filters, {
                    populate: ['tenants', 'locations'],
                    orderBy: { createdAt: 'DESC' }
                });
            } else if (currentTenantId) {
                // Find users that belong to the current tenant via the Many-to-Many relationship
                // Need to combine filters
                users = await em.find(User, {
                    ...filters,
                    tenants: { id: currentTenantId }
                }, {
                    populate: ['tenants', 'locations'],
                    orderBy: { createdAt: 'DESC' }
                });
            } else {
                return res.status(403).json({ message: 'No tenant context found' });
            }

            // Serialize with tenant info
            const serialized = users.map(u => ({
                id: u.id,
                username: u.username,
                role: u.role,
                isActive: u.isActive,
                createdAt: u.createdAt,
                tenants: u.tenants.getItems().map(t => ({ id: t.id, name: t.name })),
                locations: u.locations.getItems().map(l => ({ id: l.id, name: l.name }))
            }));

            res.json(serialized);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }

    // Get current user profile with full context
    async getProfile(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em || !req.user) return res.status(500).json({ message: 'No Context' });

            const user = await em.findOne(User, { id: req.user.id }, {
                populate: ['tenants', 'locations', 'lastActiveLocation'],
            });

            if (!user) return res.status(404).json({ message: 'User not found' });

            // Determines available locations based on Role (Copy of Login Logic)
            let availableLocations = user.locations.getItems();
            if (user.role === UserRole.ADMIN && user.tenants.length > 0) {
                const tenantIds = user.tenants.getItems().map(t => t.id);
                // Explicitly fetch ALL locations for the tenant
                const allTenantLocations = await em.find(Location, {
                    tenant: { $in: tenantIds },
                    isActive: true
                }, { filters: false });
                availableLocations = allTenantLocations as any;
            }

            res.json({
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
                })),
                locations: availableLocations.map(l => ({ id: l.id, name: l.name })),
                lastActiveLocation: user.lastActiveLocation ? { id: user.lastActiveLocation.id, name: user.lastActiveLocation.name } : null
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    }

    // Create new user (SUPER_ADMIN and ADMIN only)
    async create(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const { username, password, role, tenantId: bodyTenantId } = req.body;

            // Get tenant from context (header) OR body
            // IF Super Admin, utilize bodyTenantId if present (to allow cross-tenant creation)
            // IF Regular Admin, enforce context (req.tenant.id) to prevent privilege escalation or errors
            let currentTenantId = (req as any).tenant?.id;

            if (req.user?.role === UserRole.SUPER_ADMIN && bodyTenantId) {
                currentTenantId = bodyTenantId;
            } else {
                // Fallback or enforce context
                currentTenantId = currentTenantId || bodyTenantId;
            }

            if (!username || !password || !role) {
                return res.status(400).json({ message: 'Username, password, and role are required' });
            }

            // Verify tenant requirement
            if (role !== UserRole.SUPER_ADMIN && !currentTenantId) {
                return res.status(400).json({ message: 'Tenant context or tenantId is required to create a non-SuperAdmin user' });
            }

            const { isInvitation } = req.body;

            // Check if user already exists
            const existing = await em.findOne(User, { username }, { populate: ['tenants'] });
            if (existing) {
                if (!currentTenantId) {
                    return res.status(400).json({ message: 'Username already exists' });
                }

                // Check if already assigned to this tenant
                const isAssigned = existing.tenants.getItems().some(t => t.id === currentTenantId);
                if (isAssigned) {
                    return res.status(400).json({ message: 'User already assigned to this tenant' });
                }

                // If not assigned, assign to tenant
                const tenant = await em.findOne(Tenant, { id: currentTenantId });
                if (!tenant) {
                    return res.status(404).json({ message: 'Tenant not found' });
                }

                existing.tenants.add(tenant);
                await em.flush();

                await AuditService.log(em, 'USER_UPDATE', 'User', existing.id.toString(), req.user, {
                    action: 'Add to Tenant',
                    tenant: tenant.name
                }, req);

                const { password: _, ...userWithoutPassword } = existing;
                return res.status(201).json(userWithoutPassword);
            }

            // Validate role
            if (!Object.values(UserRole).includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            // Prevent privilege escalation: Only SUPER_ADMIN can create another SUPER_ADMIN
            if (role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
                return res.status(403).json({ message: 'Forbidden: Only Super Admins can create Super Admins' });
            }

            let hashedPassword = '';
            let resetToken = undefined;
            let resetExpires = undefined;
            let isActive = true;

            if (isInvitation) {
                // Invitation Flow
                resetToken = crypto.randomBytes(32).toString('hex');
                resetExpires = addDays(new Date(), 7); // 7 Days to accept invitation
                isActive = false; // User is inactive until they accept invitation
                hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10); // Random password
            } else {
                // Legacy / Manual Password Flow
                if (!password) {
                    return res.status(400).json({ message: 'Password is required for manual creation' });
                }
                hashedPassword = await bcrypt.hash(password, 10);
            }

            const user = em.create(User, {
                username,
                password: hashedPassword,
                role,
                isActive,
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires,
                createdAt: new Date(),
                updatedAt: new Date(),
                tokenVersion: 0
            });

            // Assign to tenant if not Super Admin (or if Super Admin wants to be in a tenant)
            if (currentTenantId) {
                const tenant = await em.findOne(Tenant, { id: currentTenantId });
                if (tenant) {
                    user.tenants.add(tenant);
                } else {
                    return res.status(404).json({ message: 'Tenant not found' });
                }
            }

            // Assign location? Usually handled in separate endpoint or defaults. User starts with 0 locations?
            // "locations" in body?
            const locationsToAssign = [];
            if (req.body.locationIds && Array.isArray(req.body.locationIds)) {
                for (const lid of req.body.locationIds) {
                    locationsToAssign.push(await em.getReference('Location', lid));
                }
                user.locations.set(locationsToAssign); // Set many to many
            }

            await em.persistAndFlush(user);

            await AuditService.log(em, 'USER_CREATE', 'User', user.id.toString(), req.user, {
                username: user.username,
                role: user.role,
                assignedLocations: locationsToAssign.length
            }, req);

            // Send Welcome Email AFTER persistence
            let emailWarning = null;
            if (isInvitation && resetToken) {
                try {
                    const { EmailService } = await import('../services/email.service');
                    const emailService = new EmailService();
                    // Use username as email
                    await emailService.sendWelcomeEmail(username, username.split('@')[0], resetToken);
                } catch (emailError: any) {
                    console.error('Failed to send welcome email:', emailError);
                    emailWarning = `User created but email failed: ${emailError.message || 'Unknown error'}`;
                }
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;

            if (emailWarning) {
                return res.status(201).json({
                    ...userWithoutPassword,
                    warning: emailWarning
                });
            }

            res.status(201).json(userWithoutPassword);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    // Update user (SUPER_ADMIN only)
    async update(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const { id } = req.params;
            const { username, role, isActive } = req.body;

            const user = await em.findOne(User, { id: Number(id) });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update fields
            if (username) user.username = username;

            // Validate role update
            if (role && Object.values(UserRole).includes(role)) {
                // Prevent privilege escalation: Only SUPER_ADMIN can set or unset SUPER_ADMIN role
                if (role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
                    return res.status(403).json({ message: 'Forbidden: Only Super Admins can assign Super Admin role' });
                }
                user.role = role;
            }

            if (typeof isActive === 'boolean') user.isActive = isActive;

            if (req.body.password) {
                user.password = await bcrypt.hash(req.body.password, 10);
            }

            await em.flush();

            await AuditService.log(em, 'USER_UPDATE', 'User', user.id.toString(), req.user, {
                updatedUser: user.username,
                updates: { username, role, isActive }
            }, req);

            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating user' });
        }
    }

    // Change password
    async changePassword(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em || !req.user) return res.status(500).json({ message: 'Internal error' });

            const { userId, currentPassword, newPassword } = req.body;

            // Users can only change their own password unless they're SUPER_ADMIN
            const targetUserId = userId || req.user.id;
            if (targetUserId !== req.user.id && req.user.role !== UserRole.SUPER_ADMIN) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const user = await em.findOne(User, { id: targetUserId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify current password ONLY if user is changing their own password
            // SuperAdmin changing someone else's password does NOT need currentPassword
            if (targetUserId === req.user.id) {
                if (!currentPassword) {
                    return res.status(400).json({ message: 'Current password is required' });
                }
                const isValid = await bcrypt.compare(currentPassword, user.password);
                if (!isValid) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
            }

            // Hash and update password
            user.password = await bcrypt.hash(newPassword, 10);

            // Security: Invalidate all existing sessions
            user.tokenVersion = (user.tokenVersion || 0) + 1;

            await em.flush();

            await AuditService.log(em, 'PASSWORD_CHANGE', 'User', user.id.toString(), req.user, {
                targetUser: user.username
            }, req);

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error changing password' });
        }
    }

    // Delete user (SUPER_ADMIN only)
    async delete(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const { id } = req.params;

            const user = await em.findOne(User, { id: Number(id) });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Prevent deleting the last SUPER_ADMIN
            if (user.role === UserRole.SUPER_ADMIN) {
                const superAdminCount = await em.count(User, { role: UserRole.SUPER_ADMIN });
                if (superAdminCount <= 1) {
                    return res.status(400).json({ message: 'Cannot delete the last SUPER_ADMIN' });
                }
            }

            await em.removeAndFlush(user);

            await AuditService.log(em, 'USER_DELETE', 'User', id, (req as any).user || { id: 0, username: 'system' }, {
                deletedUser: user.username
            }, req);

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
}
