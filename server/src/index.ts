import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import shiftRoutes from './routes/shift.routes';
import parkingRoutes from './routes/parking.routes';
import monthlyRoutes from './routes/monthly.routes';
import { User, UserRole } from './entities/User';
import bcrypt from 'bcryptjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const startServer = async () => {
    try {
        const orm = await MikroORM.init(config);
        await orm.getSchemaGenerator().updateSchema();
        console.log('✅ Database connected successfully and schema updated');

        // Seed Admin User
        const em = orm.em.fork();
        const count = await em.count(User);
        if (count === 0) {
            console.log('🌱 Seeding admin user...');
            const hashedPassword = await bcrypt.hash('123456', 10);
            const admin = em.create(User, {
                username: 'admin',
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await em.persistAndFlush(admin);
            console.log('✅ Admin user created: admin / 123456');
        }

        // Fork the entity manager for each request
        app.use((req, res, next) => {
            RequestContext.create(orm.em, next);
        });

        app.use('/api/auth', authRoutes);
        app.use('/api/shifts', shiftRoutes);
        app.use('/api/parking', parkingRoutes);
        app.use('/api/monthly', monthlyRoutes);

        app.get('/', (req, res) => {
            res.send('Parking App API is running');
        });

        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    } catch (error) {
        conso