import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { Tenant, TenantPlan } from '../entities/Tenant';
import { User } from '../entities/User';

async function updateTenant() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    const targetName = 'Prueba';

    try {
        console.log(`Searching for tenant with name: ${targetName}`);

        // Try getting tenant by name directly
        let tenant = await em.findOne(Tenant, { name: targetName }, { filters: false });

        // If not found, try getting user and then their tenant
        /*
        if (!tenant) {
            const user = await em.findOne(User, { username: 'Prueba' }, { populate: ['tenants'], filters: false });
            if (user && user.tenants.length > 0) {
                tenant = user.tenants[0];
            }
        }
        */

        if (!tenant) {
            console.error('❌ Tenant/User not found!');
            process.exit(1);
        }

        console.log(`✅ Found Tenant: ${tenant.name} (${tenant.id})`);
        console.log(`Current Plan: ${tenant.plan}, Created: ${tenant.createdAt.toISOString()}`);

        // Update Data
        const newCreatedDate = new Date('2025-12-13T10:00:00Z');
        const newTrialEnd = new Date(newCreatedDate);
        newTrialEnd.setDate(newCreatedDate.getDate() + 14); // 14 Days from creation

        tenant.plan = TenantPlan.TRIAL;
        tenant.createdAt = newCreatedDate;
        tenant.trialEndsAt = newTrialEnd; // Dec 27th

        await em.persistAndFlush(tenant);

        console.log('------------------------------------------------');
        console.log('✅ Update Successful!');
        console.log(`Plan set to: ${tenant.plan}`);
        console.log(`Created At set to: ${tenant.createdAt.toISOString()}`);
        console.log(`Trial Ends At set to: ${tenant.trialEndsAt.toISOString()}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('❌ Error updating tenant:', error);
    } finally {
        await orm.close();
    }
}

updateTenant();
