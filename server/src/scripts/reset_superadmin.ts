import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User, UserRole } from '../entities/User';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

const seed = async () => {
    const orm = await MikroORM.init(config as any);
    const em = orm.em.fork();
    const generator = orm.getSchemaGenerator();

    try {
        console.log('🗑️ Resetting database...');
        await generator.refreshDatabase();

        console.log('👥 Creating SuperAdmin...');
        const hashedPassword = await bcrypt.hash('12345678', 10);

        const superAdmin = em.create(User, {
            username: 'jabetancur12@gmail.com',
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            tokenVersion: 0,
        });

        await em.persistAndFlush(superAdmin);
        console.log('✅ Database Reset Complete');
        console.log('✅ Created SuperAdmin: jabetancur12@gmail.com / 12345678');

    } catch (error) {
        logger.error({ error }, '❌ Reset failed:');
    } finally {
        await orm.close();
    }
};

seed();
