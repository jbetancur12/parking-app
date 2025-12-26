import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User } from '../entities/User';
import { Tenant } from '../entities/Tenant';

const inspect = async () => {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    console.log('🔍 Inspecting User: test2');
    const user = await em.findOne(User, { username: 'test2' }, { populate: ['tenants'] });

    if (user) {
        console.log(`User ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`User Role: ${user.role}`);
        console.log('Tenants:');
        user.tenants.getItems().forEach(t => {
            console.log(` - [${t.id}] ${t.name} (${t.slug})`);
        });
    } else {
        console.log('❌ User test2 not found');
    }

    console.log('\n🔍 Inspecting Tenant: mepesa (search by slug/name)');
    const tenants = await em.find(Tenant, {});
    tenants.forEach(t => {
        console.log(`Tenant: [${t.id}] ${t.name} (${t.slug})`);
    });

    await orm.close();
};

inspect();
