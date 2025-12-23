import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { License, LicenseType, LicenseStatus } from './entities/License';
import { LicenseLog } from './entities/LicenseLog';
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

    // Auto-update schema in dev/production for simplicity in this phase
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

    const em = RequestContext.getEntityManager()!;
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

    // Log the action
    const log = em.create(LicenseLog, {
        license,
        action: 'INITIAL_ACTIVATION',
        hardwareId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
        createdAt: new Date()
    });
    await em.persistAndFlush(log);

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

    const em = RequestContext.getEntityManager()!;
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
    // Check status
    if (license.status !== 'active') {
        return res.json({ isValid: false, reason: license.status });
    }

    // Log the validation
    const log = em.create(LicenseLog, {
        license,
        action: 'VALIDATE',
        hardwareId: license.hardwareId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
        createdAt: new Date()
    });
    await em.persist(log);

    await em.flush();

    // Return new token (refresh)
    const signedLicense = signLicense(license, license.hardwareId!);

    res.json({
        isValid: true,
        signedLicense, // Return valid signed license for offline storage update
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

    const em = RequestContext.getEntityManager()!;

    // Check if hardware already has trial
    const existingTrial = await em.findOne(License, { hardwareId, type: 'trial' });
    if (existingTrial) {
        // Check if expired
        if (existingTrial.status === 'expired' || existingTrial.expiresAt < new Date()) {
            return res.status(403).json({ error: 'Tu periodo de prueba ha expirado. Por favor adquiere una licencia.' });
        }

        // If revoked
        if (existingTrial.status === 'revoked') {
            return res.status(403).json({ error: 'Tu periodo de prueba ha sido revocado.' });
        }

        // Return existing valid trial (recovery mode)
        // Log the validation
        const log = em.create(LicenseLog, {
            license: existingTrial,
            action: 'TRIAL_RECOVERY',
            hardwareId,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            success: true,
            createdAt: new Date()
        });
        await em.persistAndFlush(log);

        // Return new token (refresh)
        const signedLicense = signLicense(existingTrial, existingTrial.hardwareId!);

        return res.json({
            signedLicense,
            licenseKey: existingTrial.licenseKey,
            expiresAt: existingTrial.expiresAt.toISOString(),
            message: 'Trial existente recuperado'
        });
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
        type: 'trial',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await em.persistAndFlush(license);

    // Log the trial
    const log = em.create(LicenseLog, {
        license,
        action: 'TRIAL_START',
        hardwareId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
        createdAt: new Date()
    });
    await em.persistAndFlush(log);

    const signedLicense = signLicense(license, hardwareId);

    res.json({
        signedLicense,
        licenseKey: license.licenseKey,
        expiresAt: license.expiresAt.toISOString()
    });
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.LICENSE_SECRET || 'your-super-secret-jwt-key-change-this-to-something-very-long-and-random';

// Middleware for Admin Authentication
const authenticateAdmin = (req: Request, res: Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// POST /admin/login - Admin Login
app.post('/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
});

// --- ADMIN ENDPOINTS (Protected) ---
app.use('/admin', authenticateAdmin);

// GET /admin/licenses - List all licenses
app.get('/admin/licenses', async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager()!;
    const licenses = await em.find(License, {}, { orderBy: { createdAt: 'DESC' } });
    res.json(licenses);
});

// GET /admin/stats - Dashboard stats
app.get('/admin/stats', async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager()!;
    const activeLicenses = await em.count(License, { status: 'active' });
    const expiringSoon = await em.count(License, {
        status: 'active',
        expiresAt: {
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
            $gt: new Date()
        }
    });

    // Revenue estimation (mock calculation based on license types)
    // In a real app, this would query a proper Transaction/Order table
    const fullLicenses = await em.count(License, { type: 'full' });
    const estimatedRevenue = fullLicenses * 299; // Assuming $299 avg ticket

    res.json({
        activeLicenses,
        expiringSoon,
        estimatedRevenue,
        totalClients: await em.count(License, {})
    });
});

// POST /admin/licenses - Create new license
app.post('/admin/licenses', async (req: Request, res: Response) => {
    const { customerName, customerEmail, type, months = 12, maxLocations = 1 } = req.body;

    if (!customerName || !customerEmail) {
        return res.status(400).json({ error: 'Customer Name and Email required' });
    }

    const em = RequestContext.getEntityManager()!;

    const license = em.create(License, {
        licenseKey: generateLicenseKey(),
        customerId: crypto.randomUUID(),
        customerName,
        customerEmail,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
        maxLocations,
        features: [],
        status: 'pending', // Pending until activated
        type: type || 'full',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await em.persistAndFlush(license);

    res.json(license);
});

// PUT /admin/licenses/:id/revoke
app.put('/admin/licenses/:id/revoke', async (req: Request, res: Response) => {
    const { id } = req.params;
    const em = RequestContext.getEntityManager()!;

    const license = await em.findOne(License, { id: parseInt(id) });
    if (!license) return res.status(404).json({ error: 'License not found' });

    license.status = 'revoked';
    await em.flush();

    res.json(license);
});

// PUT /admin/licenses/:id/renew
app.put('/admin/licenses/:id/renew', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { months = 12 } = req.body;
    const em = RequestContext.getEntityManager()!;

    const license = await em.findOne(License, { id: parseInt(id) });
    if (!license) return res.status(404).json({ error: 'License not found' });

    // Extend expiration
    const currentExpiry = license.expiresAt > new Date() ? license.expiresAt : new Date();
    license.expiresAt = new Date(currentExpiry.getTime() + months * 30 * 24 * 60 * 60 * 1000);

    if (license.status === 'expired') license.status = 'active';

    await em.flush();

    res.json(license);
});

// PUT /admin/licenses/:id/transfer (Reset Hardware ID)
app.put('/admin/licenses/:id/transfer', async (req: Request, res: Response) => {
    const { id } = req.params;
    const em = RequestContext.getEntityManager()!;

    const license = await em.findOne(License, { id: parseInt(id) });
    if (!license) return res.status(404).json({ error: 'License not found' });

    license.hardwareId = undefined; // Reset hardware binding
    // Status remains active, but next validation will re-bind or allow re-activation
    // For stricter security, you might want to require re-activation:
    // license.status = 'pending'; 

    await em.flush();

    res.json({ message: 'License reset for transfer. Can be activated on new hardware.' });
});

// Start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 License server running on http://localhost:${PORT}`);
    });
});
