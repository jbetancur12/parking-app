import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { User, UserRole } from '../entities/User';
import { Tenant } from '../entities/Tenant';
import { Location } from '../entities/Location';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecret_parking_app_key';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    console.log(username, password);

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const em = RequestContext.getEntityManager();
    if (!em) {
        return res.status(500).json({ message: 'Entity Manager not found' });
    }

    const user = await em.findOne(User, { username }, { populate: ['tenants', 'locations', 'lastActiveLocation'] });
    console.log(user);

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
            tenants: user.tenants.getItems().map(t => ({ id: t.id, name: t.name, slug: t.slug })), // Return available tenants
            locations: user.locations.getItems().map(l => ({ id: l.id, name: l.name })), // Return available locations
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

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

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
        tenant: tenant, // Link to tenant
        createdAt: new Date(),
        updatedAt: new Date()
    } as any);

    if (location) await em?.persist(location);

    // 3. Create Super Admin User
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = em?.create(User, {
        username,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    if (admin) {
        if (tenant) admin.tenants.add(tenant); // Assign to tenant
        if (location) admin.locations.add(location); // Assign to location

        await em?.persistAndFlush(admin);
        return res.json({ message: 'Super Admin and Default Environment created successfully' });
    } else {
        return res.status(500).json({ message: 'Error creating configuration' });
    }
};
