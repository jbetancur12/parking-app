import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { License } from './entities/License';
import { generateLicenseKey, signLicense } from './utils/license-generator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

let orm: MikroORM;

// Initialize database
async function initDatabase() {
    orm = await MikroORM.init(config);
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
    console.log('✅ Database connected and schema updated');
}

// Middleware to inject EntityManager
app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'license-server' });
});

// POST /activate - Activate a license
app.post('/activate', async (req: Request, res: Response) => {
    const { licenseKey, hardwareId } = req.body;

    if (!licenseKey || !hardwareId) {
        return res.status(400).json({ error: 'licenseKey and hardwareId required' });
    }

    const em = RequestContext.getEntityManager();
    const license = await em.findOne(License, { licenseKey });

    if (!license) {
        return res.status(404).json({ error: 'License not found' });
    }

    if (license.status === 'revoked') {
        return res.status(403).json({ error: 'License revoked' });
    }

    if (license.status === 'expired') {
        return res.status(403).json({ error: 'License expired' });
    }

    // Check if already activated on different hardware
    if (license.hardwareId && license.hardwareId !== hardwareId) {
        return res.status(409).json({
            error: 'License already activated on another device',
            contact: 'Contact support to transfer license'
        });
    }

    // Activate license
    license.hardwareId = hardwareId;
    license.activatedAt = new Date();
    license.status = 'active';
    license.lastValidatedAt = new Date();
    await em.flush();

    // Generate signed JWT
    const signedLicense = signLicense(license, hardwareId);

    res.json({
        signedLicense,
        expiresAt: license.expiresAt.toISOString()
    });
});

// POST /validate - Validate a license
app.post('/validate', async (req: Request, res: Response) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
        return res.status(400).json({ error: 'licenseKey required' });
    }

    const em = RequestContext.getEntityManager();
    const license = await em.findOne(License, { licenseKey });

    if (!license) {
        return res.status(404).json({ error: 'License not found', isValid: false });
    }

    // Update last validated
    license.lastValidatedAt = new Date();

    // Check if expired
    if (license.expiresAt < new Date()) {
        license.status = 'expired';
        await em.flush();
        return res.json({ isValid: false, reason: 'expired' });
    }

    // Check status
    if (license.status !== 'active') {
        return res.json({ isValid: false, reason: license.status });
    }

    await em.flush();

    res.json({
        isValid: true,
        expiresAt: license.expiresAt.toISOString(),
        daysRemaining: Math.ceil((license.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    });
});

// POST /trial - Generate trial license
app.post('/trial', async (req: Request, res: Response) => {
    const { hardwareId } = req.body;

    if (!hardwareId) {
        return res.status(400).json({ error: 'hardwareId required' });
    }

    const em = RequestContext.getEntityManager();

    // Check if hardware already has trial
    const existingTrial = await em.findOne(License, { hardwareId, type: 'trial' });
    if (existingTrial) {
        return res.status(409).json({ error: 'Trial already used on this device' });
    }

    // Create trial license
    const license = em.create(License, {
        licenseKey: generateLicenseKey(),
        customerId: crypto.randomUUID(),
        customerName: 'Trial User',
        customerEmail: 'trial@temp.com',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        hardwareId,
        activatedAt: new Date(),
        lastValidatedAt: new Date(),
        maxLocations: 1,
        features: [],
        status: 'active',
        type: 'trial'
    });

    await em.persistAndFlush(license);

    const signedLicense = signLicense(license, hardwareId);

    res.json({
        signedLicense,
        licenseKey: license.licenseKey,
        expiresAt: license.expiresAt.toISOString()
    });
});

// Start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 License server running on http://localhost:${PORT}`);
    });
});
