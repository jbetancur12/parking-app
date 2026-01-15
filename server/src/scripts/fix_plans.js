require('dotenv').config();
const { MikroORM } = require('@mikro-orm/core');
const { PostgreSqlDriver } = require('@mikro-orm/postgresql');

async function fixPlans() {
    const config = {
        driver: PostgreSqlDriver,
        dbName: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        allowGlobalContext: true,
        entities: [],
        discovery: { disableDynamicFileAccess: true }
    };

    console.log(`Connecting to database ${config.dbName} at ${config.host}...`);

    try {
        const orm = await MikroORM.init(config);
        const em = orm.em.fork();

        console.log('Checking for legacy plans...');
        const count = await em.execute(`SELECT count(*) FROM "tenant" WHERE "plan" = 'free'`);
        console.log(`Found ${count[0]?.count || 0} rows with plan='free'`);

        console.log('Running update...');
        await em.execute(`UPDATE "tenant" SET "plan" = 'basic' WHERE "plan" = 'free'`);
        console.log('✅ Update complete. Rows should now be compliant.');
        await orm.close();
    } catch (e) {
        logger.error({ e }, '❌ Error:');
    }
}

fixPlans();
