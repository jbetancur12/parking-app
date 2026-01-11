import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
        tenant?: {
            id: number;
            plan: string;
        };
    };
}

import { RequestContext } from '@mikro-orm/core';
import { User } from '../entities/User';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

        // Security Check: Token Version
        // We need to fetch the user to verify if the token is still valid (has not been revoked via password change)
        const em = RequestContext.getEntityManager();
        if (em) {
            // We use a lightweight query just for version check if possible, or just findOne
            // Disable filters to ensure we find the user regardless of tenant context (auth is global)
            const user = await em.findOne(User, { id: decoded.id }, {
                filters: false,
                fields: ['tokenVersion', 'username', 'role', 'isActive'] // Optimize: Select only needed fields
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: 'User is inactive' });
            }

            const tokenVersion = decoded.tokenVersion || 0;
            const currentVersion = user.tokenVersion || 0;

            if (currentVersion > tokenVersion) {
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }
        }

        req.user = decoded; // Keep using decoded for speed in other middlewares, or use fetched user? 
        // Using decoded is faster if we trust it, but we verified it against DB version. 
        // We might want to refresh req.user with DB data if roles changed? 
        // For now, let's stick to decoded + version check to keep it close to original logic but safer.

        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};


export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

// Alias for consistency with other parts of the app if needed
export const authorizeRole = requireRole;
