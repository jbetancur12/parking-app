import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './mikro-orm.config';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import shiftRoutes from './routes/shift.routes';
import parkingRoutes from './routes/parking.routes';
import monthlyRoutes from './routes/monthly.routes';
import reportRoutes from './routes/report.routes';
import expenseRoutes from './routes/expense.routes';
import washRoutes from './routes/wash.routes';
import brandRoutes from './routes/brand.routes';
import saleRoutes from './routes/sale.routes';
import tariffRoutes from './routes/tariff.routes';
import settingRoutes from './routes/setting.routes';
import userRoutes from './routes/user.routes';
import transactionRoutes from './routes/transaction.routes';
import statsRoutes from './routes/stats.routes';
import backupRoutes from './routes/backup.routes';
import { Tariff } from './entities/Tariff';
import { SystemSetting } from './entities/SystemSetting';
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
            console.log('🌱 Seeding super admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = em.create(User, {
                username: 'admin',
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await em.persistAndFlush(admin);
            console.log('✅ Super Admin user created: admin / admin123');
        }

        // Fork the entity manager for each request
        app.use((req, res, next) => {
            RequestContext.create(orm.em, next);
        });

        app.use('/api/auth', authRoutes);
        app.use('/api/shifts', shiftRoutes);
        app.use('/api/parking', parkingRoutes);
        app.use('/api/monthly', monthlyRoutes);
        app.use('/api/reports', reportRoutes);
        app.use('/api/expenses', expenseRoutes);
        app.use('/api/wash', washRoutes);
        app.use('/api/brands', brandRoutes);
        app.use('/api/sales', saleRoutes);
        app.use('/api/tariffs', tariffRoutes);
        app.use('/api/settings', settingRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/transactions', transactionRoutes);
        app.use('/api/stats', statsRoutes);
        app.use('/api/backup', backupRoutes);

        app.get('/', (req, res) => {
            res.send('Parking App API is running');
        });

        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

startServer();
