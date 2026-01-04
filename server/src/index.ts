import 'reflect-metadata'; // Required for class-validator decorators
import dns from 'node:dns';
// Force IPv4 for Supabase connection (fixes ENETUNREACH on Render/Node 20)
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './mikro-orm.config';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
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
import auditRoutes from './routes/audit.routes';
import agreementRoutes from './routes/agreement.routes';
import adminRoutes from './routes/admin.routes';
import productRoutes from './routes/product.routes';
import subscriptionRoutes from './routes/subscription.routes';
import billingRoutes from './routes/billing.routes';
import usageRoutes from './routes/usage.routes';
import { Tariff } from './entities/Tariff';
import { SystemSetting } from './entities/SystemSetting';
import { User, UserRole } from './entities/User';
import bcrypt from 'bcryptjs';
import { saasContext } from './middleware/saasContext';
import { authenticateToken } from './middleware/auth.middleware';
import { verifyTenantAccess } from './middleware/permission.middleware';
import { startSubscriptionCronJob } from './jobs/subscription.cron';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const startServer = async () => {
    try {
        const orm = await MikroORM.init(config);
        await orm.getSchemaGenerator().updateSchema();
        console.log('✅ Database connected successfully and schema updated');

        // Fork the entity manager for each request
        app.use((req, res, next) => {
            RequestContext.create(orm.em, next);
        });

        // Public Routes (NO SAAS CONTEXT HERE)
        app.use('/api/auth', authRoutes);
        app.use('/api/parking', parkingRoutes); // Managed internally (mixed public/private)

        // Protected Routes Middleware
        // All API routes below this point require Authentication and Valid Tenant Context
        const protectedApi = express.Router();
        protectedApi.use(authenticateToken);
        protectedApi.use(saasContext); // Apply SaaS context AFTER authentication
        protectedApi.use(verifyTenantAccess);

        protectedApi.use('/shifts', shiftRoutes);
        // Parking routes have mixed public/private endpoints, handled internally
        // protectedApi.use('/parking', parkingRoutes); --> Moved to app.use

        protectedApi.use('/monthly', monthlyRoutes);
        protectedApi.use('/reports', reportRoutes);
        protectedApi.use('/expenses', expenseRoutes);
        protectedApi.use('/wash', washRoutes);
        protectedApi.use('/brands', brandRoutes);
        protectedApi.use('/sales', saleRoutes);
        protectedApi.use('/tariffs', tariffRoutes);
        protectedApi.use('/settings', settingRoutes);
        protectedApi.use('/users', userRoutes);
        protectedApi.use('/transactions', transactionRoutes);
        protectedApi.use('/stats', statsRoutes);
        protectedApi.use('/backup', backupRoutes);
        protectedApi.use('/audit', auditRoutes);
        protectedApi.use('/agreements', agreementRoutes);
        protectedApi.use('/admin', adminRoutes); // SuperAdmin routes
        protectedApi.use('/products', productRoutes);
        protectedApi.use('/subscription', subscriptionRoutes); // Subscription management
        protectedApi.use('/billing', billingRoutes); // Invoices and payments

        app.use('/api', protectedApi);

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

