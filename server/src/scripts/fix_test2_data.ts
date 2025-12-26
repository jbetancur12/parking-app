import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User } from '../entities/User';
import { Tenant } from '../entities/Tenant';

const fix = async () => {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    console.log('🔧 Fixing User: test2');
    const user = await em.findOne(User, { username: 'test2' }, { populate: ['tenants'] });

    if (user) {
        // Find 'daiana' tenant to remove
        const daiana = user.tenants.getItems().find(t => t.slug === 'daiana');
        if (daiana) {
            console.log(`Removing link to tenant: ${daiana.name}`);
            user.tenants.remove(daiana);
            await em.flush();
            console.log('✅ Link removed.');
        } else {
            console.log('User is not linked to Daiana.');
        }
    } else {
        console.log('❌ User test2 not found');
    }

    await orm.close();
};

fix();
