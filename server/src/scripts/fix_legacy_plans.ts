import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixLegacyPlans() {
    console.log('🔄 Starting legacy plan data fix...');

    // Support both DATABASE_URL (common in Render) and individual vars
    const connectionConfig: any = {
        connectionString: process.env.DATABASE_URL,
    };

    // If no DATABASE_URL, fall back to individual vars
    if (!process.env.DATABASE_URL) {
        connectionConfig.user = process.env.DB_USER;
        connectionConfig.host = process.env.DB_HOST;
        connectionConfig.database = process.env.DB_NAME;
        connectionConfig.password = process.env.DB_PASSWORD;
        connectionConfig.port = Number(process.env.DB_PORT);
    }

    // SSL is typically required in production (Render), but depends on env var
    if (process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true') {
        connectionConfig.ssl = {
            rejectUnauthorized: false
        };
    }

    const client = new Client(connectionConfig);

    try {
        await client.connect();
        console.log('✅ Connected to database.');

        // 1. Fix 'free' -> 'basic'
        const result1 = await client.query(`UPDATE "tenant" SET "plan" = 'basic' WHERE "plan" = 'free'`);
        if (result1.rowCount && result1.rowCount > 0) {
            console.log(`🛠️  Fixed ${result1.rowCount} rows with 'free' plan.`);
        }

        // 2. Fix any other invalid values just in case
        const result2 = await client.query(`UPDATE "tenant" SET "plan" = 'basic' WHERE "plan" NOT IN ('basic', 'trial', 'pro', 'enterprise')`);
        if (result2.rowCount && result2.rowCount > 0) {
            console.log(`🛠️  Fixed ${result2.rowCount} rows with unknown plan types.`);
        }

        console.log('✅ Plan data verification complete.');
    } catch (err) {
        console.error('⚠️  Error running plan fix script:', err);
        // We don't exit(1) to allow the server to attempt startup anyway, 
        // in case this is just a connection glitch but the app might work.
    } finally {
        await client.end();
    }
}

fixLegacyPlans();
