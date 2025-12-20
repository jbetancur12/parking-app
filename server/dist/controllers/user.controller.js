"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const core_1 = require("@mikro-orm/core");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    // Get all users (SUPER_ADMIN only)
    async getAll(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const users = await em.find(User_1.User, {}, {
                orderBy: { createdAt: 'DESC' },
                fields: ['id', 'username', 'role', 'isActive', 'createdAt'] // Exclude password
            });
            res.json(users);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }
    // Create new user (SUPER_ADMIN only)
    async create(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { username, password, role } = req.body;
            if (!username || !password || !role) {
                return res.status(400).json({ message: 'Username, password, and role are required' });
            }
            // Check if user already exists
            const existing = await em.findOne(User_1.User, { username });
            if (existing) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            // Validate role
            if (!Object.values(User_1.UserRole).includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = em.create(User_1.User, {
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }
    // Update user (SUPER_ADMIN only)
    async update(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { id } = req.params;
            const { username, role, isActive } = req.body;
            const user = await em.findOne(User_1.User, { id: Number(id) });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Update fields
            if (username)
                user.username = username;
            if (role && Object.values(User_1.UserRole).includes(role))
                user.role = role;
            if (typeof isActive === 'boolean')
                user.isActive = isActive;
            await em.flush();
            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating user' });
        }
    }
    // Change password
    async changePassword(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em || !req.user)
                return res.status(500).json({ message: 'Internal error' });
            const { userId, currentPassword, newPassword } = req.body;
            // Users can only change their own password unless they're SUPER_ADMIN
            const targetUserId = userId || req.user.id;
            if (targetUserId !== req.user.id && req.user.role !== User_1.UserRole.SUPER_ADMIN) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            const user = await em.findOne(User_1.User, { id: targetUserId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Verify current password if not SUPER_ADMIN changing someone else's password
            if (targetUserId === req.user.id) {
                const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isValid) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
            }
            // Hash and update password
            user.password = await bcryptjs_1.default.hash(newPassword, 10);
            await em.flush();
            res.json({ message: 'Password updated successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error changing password' });
        }
    }
    // Delete user (SUPER_ADMIN only)
    async delete(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { id } = req.params;
            const user = await em.findOne(User_1.User, { id: Number(id) });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Prevent deleting the last SUPER_ADMIN
            if (user.role === User_1.UserRole.SUPER_ADMIN) {
                const superAdminCount = await em.count(User_1.User, { role: User_1.UserRole.SUPER_ADMIN });
                if (superAdminCount <= 1) {
                    return res.status(400).json({ message: 'Cannot delete the last SUPER_ADMIN' });
                }
            }
            await em.removeAndFlush(user);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
}
exports.UserController = UserController;
