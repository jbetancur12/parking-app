import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { AuditLog } from '../entities/AuditLog';

const cleanupLogs = async () => {
    try {
        const orm = await MikroORM.init(config);
        const em = orm.em.fork();

        // Calculate date 90 days ago
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        console.log(`🧹 Cleaning up logs older than: ${ninetyDaysAgo.toISOString()}`);

        // Delete logs older than 90 days
        const limitDate = ninetyDaysAgo;

        // Use nativeDelete for simple deletion
        const result = await em.nativeDelete(AuditLog, { timestamp: { $lt: limitDate } });

        console.log(`✅ Cleanup complete. Deleted ${result} old logs.`);

        await orm.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupLogs();
