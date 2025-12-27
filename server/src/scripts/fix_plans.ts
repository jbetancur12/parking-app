import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';

async function fixPlans() {
    console.log('Iniciando corrección de planes...');
    try {
        const orm = await MikroORM.init(config);
        const em = orm.em.fork();

        // Check count before update
        const resultBefore = await em.execute(`SELECT count(*) as count FROM "tenant" WHERE "plan" = 'free'`);
        console.log(`Encontrados ${resultBefore[0]?.count || 0} tenants con plan 'free'.`);

        // Execute raw SQL update
        await em.execute(`UPDATE "tenant" SET "plan" = 'basic' WHERE "plan" = 'free'`);
        console.log('✅ Registros actualizados de "free" a "basic" exitosamente.');

        await orm.close();
    } catch (error) {
        console.error('❌ Error durante la corrección:', error);
        process.exit(1);
    }
}

fixPlans();
