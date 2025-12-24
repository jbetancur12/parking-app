
import { MikroORM } from '@mikro-orm/core';
import config from './src/mikro-orm.config';
import { Shift } from './src/entities/Shift';
import { User } from './src/entities/User';

async function checkShifts() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        const shifts = await em.find(Shift, {}, { populate: ['user', 'tenant', 'location'] });
        console.log('Total Shifts:', shifts.length);
        shifts.forEach(s => {
            console.log(`Shift ID: ${s.id}, User: ${s.user.username} (${s.user.id}), Active: ${s.isActive}, Tenant: ${s.tenant?.name}, Location: ${s.location?.name}`);
        });

        const activeShifts = await em.find(Shift, { isActive: true }, { populate: ['user'] });
        console.log('Active Shifts:', activeShifts.length);
    } catch (error) {
        console.error(error);
    } finally {
        await orm.close();
    }
}

checkShifts();
