import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecret_parking_app_key';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
        return res.status(500).json({ message: 'Entity Manager not found' });
    }

    const user = await em.findOne(User, { username });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: '12h' }
    );

    return res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
        },
    });
};
