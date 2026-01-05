
import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { Payment } from './entities/Payment';
import { Location } from './entities/Location';
import { Tenant } from './entities/Tenant';
import { PricingPlan } from './entities/PricingPlan';

(async () => {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    console.log('--- Checking Payments ---');
    const payments = await em.find(Payment, {}, { orderBy: { amount: 'DESC' }, limit: 5 });
    payments.forEach(p => console.log(`Payment: ${p.amount} (${p.status}) - ID: ${p.id}`));

    console.log('\n--- Checking Locations ---');
    const locations = await em.find(Location, {});
    console.log(`Total Locations: ${locations.length}`);
    locations.forEach(l => console.log(`Location: ${l.name} - Tenant: ${l.tenant?.id}`));

    console.log('\n--- Checking Tenants & Locations Relation ---');
    const tenants = await em.find(Tenant, {}, { populate: ['locations'] });
    tenants.forEach(t => console.log(`Tenant: ${t.name} - Locations: ${t.locations.length}`));

    console.log('\n--- Checking Pricing Plans ---');
    const plans = await em.find(PricingPlan, {});
    plans.forEach(p => console.log(`Plan: ${p.name} - Price: ${p.price}`));

    await orm.close();
})();
