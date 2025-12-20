import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { User, UserRole } from '../entities/User';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

export class UserController {
    // Get all users (SUPER_ADMIN only)
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const users = await em.find(User, {}, {
                orderBy: { createdAt: 'DESC' },
                fields: ['id', 'username', 'role', 'isActive', 'createdAt'] // Exclude password
            });

            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }

    // Create new user (SUPER_ADMIN only)
    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const { username, password, role } = req.body;

            if (!username || !password || !role) {
                return res.status(400).json({ message: 'Username, password, and role are required' });
            }

            // Check if user already exists
            const existing = await em.findOne(User, { username });
            if (existing) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Validate role
            if (!Object.values(UserRole).includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = em.create(User, {
                username,
                password: hashedPassword,
                role,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await em.persistAndFlush(user);

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    // Update user (SUPER_ADMIN only)
    async update(req: Request, res: Response) {
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
            if (role && Object.values(UserRole).includes(role)) user.role = role;
            if (typeof isActive === 'boolean') user.isActive = isActive;

            await em.flush();

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

            // Verify current password if not SUPER_ADMIN changing someone else's password
            if (targetUserId === req.user.id) {
                const isValid = await bcrypt.compare(currentPassword, user.password);
                if (!isValid) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
            }

            // Hash and update password
            user.password = await bcrypt.hash(newPassword, 10);
            await em.flush();

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
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
}
