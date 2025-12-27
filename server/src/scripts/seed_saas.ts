import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { Tenant, TenantStatus, TenantPlan } from '../entities/Tenant';
import { Location } from '../entities/Location';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

async function seedSaaS() {
    console.log('🌱 Starting SaaS seed...');

    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        // 1. Create or get SuperAdmin
        console.log('\n👑 Creating SuperAdmin user...');
        let superAdmin = await em.findOne(User, { username: 'superadmin' });

        if (!superAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            superAdmin = em.create(User, {
                username: 'superadmin',
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            await em.persistAndFlush(superAdmin);
            console.log('✅ SuperAdmin created (username: superadmin, password: admin123)');
        } else {
            console.log('ℹ️  SuperAdmin already exists');
        }

        // 2. Create Test Tenant 1: Parqueadero Don Pepe
        console.log('\n🏢 Creating Tenant: Parqueadero Don Pepe...');
        let donpepeTenant = await em.findOne(Tenant, { slug: 'donpepe' });

        if (!donpepeTenant) {
            donpepeTenant = em.create(Tenant, {
                name: 'Parqueadero Don Pepe',
                slug: 'donpepe',
                contactEmail: 'admin@donpepe.com',
                plan: TenantPlan.PRO,
                status: TenantStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            await em.persistAndFlush(donpepeTenant);
            console.log('✅ Tenant "Parqueadero Don Pepe" created');
        } else {
            console.log('ℹ️  Tenant "Parqueadero Don Pepe" already exists');
        }

        // 3. Create Locations for Don Pepe
        console.log('\n📍 Creating Locations for Don Pepe...');

        const donpepeLocations = [
            { name: 'Sede Centro', address: 'Calle 50 #25-30, Centro', phone: '+57 300 123 4567' },
            { name: 'Sede Norte', address: 'Av. 80 #100-50, Norte', phone: '+57 300 123 4568' },
        ];

        for (const locData of donpepeLocations) {
            const existing = await em.findOne(Location, {
                tenant: donpepeTenant,
                name: locData.name
            });

            if (!existing) {
                const location = em.create(Location, {
                    tenant: donpepeTenant,
                    name: locData.name,
                    address: locData.address,
                    phone: locData.phone,
                    settings: {},
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any);
                await em.persistAndFlush(location);
                console.log(`✅ Location "${locData.name}" created`);
            } else {
                console.log(`ℹ️  Location "${locData.name}" already exists`);
            }
        }

        // 4. Create Test Tenant 2: Parking Plaza
        console.log('\n🏢 Creating Tenant: Parking Plaza...');
        let plazaTenant = await em.findOne(Tenant, { slug: 'parkingplaza' });

        if (!plazaTenant) {
            plazaTenant = em.create(Tenant, {
                name: 'Parking Plaza',
                slug: 'parkingplaza',
                contactEmail: 'info@parkingplaza.com',
                plan: TenantPlan.BASIC,
                status: TenantStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            await em.persistAndFlush(plazaTenant);
            console.log('✅ Tenant "Parking Plaza" created');
        } else {
            console.log('ℹ️  Tenant "Parking Plaza" already exists');
        }

        // 5. Create Location for Parking Plaza
        console.log('\n📍 Creating Location for Parking Plaza...');
        const plazaLocationData = {
            name: 'Sede Principal',
            address: 'Carrera 15 #70-20',
            phone: '+57 301 555 8888'
        };

        const existingPlazaLoc = await em.findOne(Location, {
            tenant: plazaTenant,
            name: plazaLocationData.name
        });

        if (!existingPlazaLoc) {
            const location = em.create(Location, {
                tenant: plazaTenant,
                name: plazaLocationData.name,
                address: plazaLocationData.address,
                phone: plazaLocationData.phone,
                settings: {},
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            await em.persistAndFlush(location);
            console.log(`✅ Location "${plazaLocationData.name}" created`);
        } else {
            console.log(`ℹ️  Location "${plazaLocationData.name}" already exists`);
        }

        // 6. Create Test Users
        console.log('\n👥 Creating test users...');

        const testUsers = [
            {
                username: 'admin.donpepe',
                password: 'admin123',
                role: UserRole.ADMIN,
                tenants: [donpepeTenant],
                description: 'Admin for Don Pepe'
            },
            {
                username: 'operador.donpepe',
                password: 'oper123',
                role: UserRole.OPERATOR,
                tenants: [donpepeTenant],
                description: 'Operator for Don Pepe'
            },
            {
                username: 'admin.plaza',
                password: 'admin123',
                role: UserRole.ADMIN,
                tenants: [plazaTenant],
                description: 'Admin for Parking Plaza'
            },
            {
                username: 'multi.user',
                password: 'multi123',
                role: UserRole.OPERATOR,
                tenants: [donpepeTenant, plazaTenant],
                description: 'Multi-tenant operator (access to both)'
            },
        ];

        for (const userData of testUsers) {
            let user: any = await em.findOne(User, { username: userData.username }, { populate: ['tenants'] });

            if (!user) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                user = em.create(User, {
                    username: userData.username,
                    password: hashedPassword,
                    role: userData.role,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any);

                // Assign tenants
                if (user) {
                    userData.tenants.forEach(tenant => {
                        user!.tenants.add(tenant);
                    });
                }

                await em.persistAndFlush(user);
                console.log(`✅ User "${userData.username}" created (${userData.description})`);
            } else {
                console.log(`ℹ️  User "${userData.username}" already exists`);
            }
        }

        console.log('\n✨ SaaS seed completed successfully!\n');

        // Print summary
        console.log('📋 Summary:');
        console.log('━'.repeat(50));
        console.log('SuperAdmin:');
        console.log('  - superadmin / admin123');
        console.log('\nTenant: Parqueadero Don Pepe (@donpepe)');
        console.log('  Locations: Sede Centro, Sede Norte');
        console.log('  Users:');
        console.log('    - admin.donpepe / admin123 (ADMIN)');
        console.log('    - operador.donpepe / oper123 (OPERATOR)');
        console.log('\nTenant: Parking Plaza (@parkingplaza)');
        console.log('  Locations: Sede Principal');
        console.log('  Users:');
        console.log('    - admin.plaza / admin123 (ADMIN)');
        console.log('\nMulti-Tenant User:');
        console.log('  - multi.user / multi123 (access to both tenants)');
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await orm.close();
    }
}

seedSaaS()
    .then(() => {
        console.log('\n✅ Seed script finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seed script failed:', error);
        process.exit(1);
    });
