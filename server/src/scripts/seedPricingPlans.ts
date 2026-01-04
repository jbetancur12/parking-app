/**
 * Database Seeding Script for Pricing Plans
 * 
 * Run this script once to populate the pricing_plan table with default plans
 * 
 * Usage: ts-node server/src/scripts/seedPricingPlans.ts
 */

import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { PricingPlan } from '../entities/PricingPlan';

const defaultPlans = [
    {
        code: 'trial',
        name: 'Trial',
        price: 0,
        billingPeriod: 'monthly',
        maxLocations: 3,
        maxUsers: 5,
        maxSessions: 5000,
        features: [
            'Todas las features de Pro',
            '14 días gratis',
            'Sin tarjeta de crédito',
            'Soporte por email'
        ],
        support: 'Email',
        isActive: true,
        displayOrder: 0
    },
    {
        code: 'basic',
        name: 'Basic',
        price: 49,
        billingPeriod: 'monthly',
        maxLocations: 1,
        maxUsers: 2,
        maxSessions: 1000,
        features: [
            '1 Sede',
            '2 Usuarios',
            '1,000 sesiones/mes',
            'Reportes básicos',
            'Soporte por email'
        ],
        support: 'Email',
        isActive: true,
        displayOrder: 1
    },
    {
        code: 'pro',
        name: 'Pro',
        price: 99,
        billingPeriod: 'monthly',
        maxLocations: 3,
        maxUsers: 5,
        maxSessions: 5000,
        features: [
            '3 Sedes',
            '5 Usuarios',
            '5,000 sesiones/mes',
            'Reportes avanzados',
            'Soporte prioritario',
            'Integraciones API'
        ],
        support: 'Priority',
        isActive: true,
        displayOrder: 2
    },
    {
        code: 'enterprise',
        name: 'Enterprise',
        price: 0, // Custom pricing
        billingPeriod: 'monthly',
        maxLocations: -1, // Unlimited
        maxUsers: -1, // Unlimited
        maxSessions: -1, // Unlimited
        features: [
            'Sedes ilimitadas',
            'Usuarios ilimitados',
            'Sesiones ilimitadas',
            'Reportes personalizados',
            'Soporte 24/7',
            'Integraciones personalizadas',
            'SLA garantizado',
            'Gerente de cuenta dedicado'
        ],
        support: '24/7',
        isActive: true,
        displayOrder: 3
    }
];

async function seedPricingPlans() {
    console.log('🌱 Starting pricing plans seeding...');

    const orm = await MikroORM.init(config);

    await RequestContext.create(orm.em, async () => {
        const em = orm.em.fork();

        try {
            // Check if plans already exist
            const existingPlans = await em.count(PricingPlan);

            if (existingPlans > 0) {
                console.log(`⚠️  Found ${existingPlans} existing plans. Skipping seed.`);
                console.log('   To re-seed, delete existing plans first.');
                return;
            }

            // Create plans
            for (const planData of defaultPlans) {
                const plan = em.create(PricingPlan, planData as any);
                await em.persist(plan);
                console.log(`✅ Created plan: ${planData.name} (${planData.code})`);
            }

            await em.flush();
            console.log(`\n🎉 Successfully seeded ${defaultPlans.length} pricing plans!`);
        } catch (error) {
            console.error('❌ Error seeding pricing plans:', error);
            throw error;
        }
    });

    await orm.close();
}

// Run the seeding
seedPricingPlans()
    .then(() => {
        console.log('\n✨ Seeding completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });
