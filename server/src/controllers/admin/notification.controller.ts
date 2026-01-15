import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { SystemNotification, NotificationType } from '../../entities/SystemNotification';
import { UserRole } from '../../entities/User';
import { logger } from '../../utils/logger';

export const createNotification = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    const { title, message, type, targetRoles, expiresAt } = req.body;

    if (!title || !message) {
        return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = em?.create(SystemNotification, {
        title,
        message,
        type: type || NotificationType.INFO,
        targetRoles: targetRoles || [],
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    if (notification) {
        await em?.persistAndFlush(notification);
        return res.status(201).json(notification);
    }

    return res.status(500).json({ message: 'Failed to create notification' });
};

export const deleteNotification = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    const { id } = req.params;

    const notification = await em?.findOne(SystemNotification, { id });
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    // Instead of hard delete, we can soft delete or just set isActive false
    // But for simplicity let's just remove it or deactivate. 
    // Let's hard delete for now to keep DB clean, or use isActive.
    // Given the requirement "delete", let's remove.
    await em?.removeAndFlush(notification);
    return res.json({ message: 'Notification deleted' });
};

export const getActiveNotifications = async (req: Request, res: Response) => {
    try {
        const em = RequestContext.getEntityManager();
        const user = (req as any).user;

        // Find active notifications
        // 1. isActive = true
        // 2. Not expired
        const now = new Date();

        const notifications = await em?.find(SystemNotification, {
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        }, {
            orderBy: { createdAt: 'DESC' }
        });

        if (!notifications) return res.json([]);

        // Filter by role in memory (easier for JSON arrays)
        const visibleNotifications = notifications.filter(n => {
            if (!n.targetRoles || n.targetRoles.length === 0) return true; // Global
            if (!user) return true; // Public? Maybe restrict to logged in. 
            // If user exists, check if their role is in targetRoles
            return n.targetRoles.includes(user.role);
        });

        return res.json(visibleNotifications);

    } catch (error) {
        logger.error({ error }, 'Error fetching notifications:');
        return res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const getAllNotificationsAdmin = async (req: Request, res: Response) => {
    // For admin dashboard, see all (active or not)
    const em = RequestContext.getEntityManager();
    const notifications = await em?.find(SystemNotification, {}, {
        orderBy: { createdAt: 'DESC' }
    });
    return res.json(notifications);
};
