import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User } from '../entities/User';
import { logger } from '../utils/logger';

async function checkUsers() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        const users = await em.find(User, {});
        console.log(`\n📊 Total users in database: ${users.length}\n`);

        users.forEach(user => {
            console.log(`- ${user.username} (${user.role}) - Active: ${user.isActive}`);
        });

        if (users.length === 0) {
            console.log('\n⚠️  No users found! The seed script may not have run successfully.');
        }
    } catch (error) {
        logger.error({ error }, '❌ Error:');
    } finally {
        await orm.close();
    }
}

checkUsers();
