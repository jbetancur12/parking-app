// @ts-nocheck
import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User, UserRole } from '../entities/User';
import { MonthlyClient } from '../entities/MonthlyClient';
import { ParkingSession, VehicleType, PlanType, ParkingStatus } from '../entities/ParkingSession';
import { Shift } from '../entities/Shift';
import { Tariff, TariffType } from '../entities/Tariff';
import { Transaction } from '../entities/Transaction';
import { WashEntry } from '../entities/WashEntry';
import { Expense } from '../entities/Expense';
import { Brand } from '../entities/Brand';
import { SystemSetting } from '../entities/SystemSetting';
import { WashServiceType } from '../entities/WashServiceType';
import { MonthlyPayment } from '../entities/MonthlyPayment';
import bcrypt from 'bcryptjs';

const seed = async () => {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        console.log('🗑️ Cleaning database...');
        // Deletion Order (Child -> Parent)
        await em.nativeDelete(Transaction, {});
        await em.nativeDelete(ParkingSession, {});
        await em.nativeDelete(WashEntry, {});
        await em.nativeDelete(Expense, {});
        await em.nativeDelete(MonthlyPayment, {});

        await em.nativeDelete(MonthlyClient, {});
        await em.nativeDelete(Shift, {});

        await em.nativeDelete(User, {});
        await em.nativeDelete(Tariff, {});
        await em.nativeDelete(Brand, {});
        await em.nativeDelete(SystemSetting, {});
        await em.nativeDelete(WashServiceType, {});

        console.log('👥 Creating Users...');
        const hashedPassword = await bcrypt.hash('12345678', 10);

        const superAdmin = em.create(User, {
            username: 'jabetancur12@gmail.com',
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,
        });

        const operator = em.create(User, {
            username: 'andreinacampos0510@gmail.com',
            password: hashedPassword,
            role: UserRole.OPERATOR,
        });

        // Also creating a generic admin/operator just in case the specific emails aren't what they want for testing
        // But adhering to user rules for credentials "For Trasferencista 1" (using operator here)
        // Wait, "Trasferencista" is likely not "Operator" in Parking context, but I will stick to the requested roles.
        // Prompt asked for "un admin un operador". 
        // I will stick to the emails in User Rules if possible, or generic ones.
        // User Rules say:
        // superadmin: jabetancur12@gmail.com
        // Trasferencista: andreinacampos0510@gmail.com (Likely Operator equivalent here)
        // Minorista: ...

        // I'll add a generic operator too just to be safe for "un operador".
        const genericOperator = em.create(User, {
            username: 'operador',
            password: hashedPassword,
            role: UserRole.OPERATOR,
        });

        await em.persistAndFlush([superAdmin, operator, genericOperator]);

        console.log('⏰ Creating Active Shift...');
        const shift = em.create(Shift, {
            user: operator,
            startTime: new Date(),
            isActive: true,
            baseAmount: 200000,
        });
        await em.persistAndFlush(shift);

        console.log('💰 Creating Tariffs...');
        const tariffEntities = [];
        const tariffs = [
            { vehicleType: 'CAR', tariffType: 'HOUR', cost: 3000 },
            { vehicleType: 'CAR', tariffType: 'DAY', cost: 15000 },
            { vehicleType: 'MOTORCYCLE', tariffType: 'HOUR', cost: 2000 },
            { vehicleType: 'MOTORCYCLE', tariffType: 'DAY', cost: 8000 },
            { vehicleType: 'OTHER', tariffType: 'HOUR', cost: 5000 },
            { vehicleType: 'OTHER', tariffType: 'DAY', cost: 25000 },
        ];

        for (const t of tariffs) {
            const tariff = em.create(Tariff, {
                vehicleType: t.vehicleType,
                tariffType: t.tariffType as TariffType, // Cast to any if needed, but entity uses string or enum?
                cost: t.cost
            });
            tariffEntities.push(tariff);
        }
        await em.persistAndFlush(tariffEntities); // Flush tariffs explicitly if needed, or with next batch

        console.log('📅 Creating Monthly Clients...');
        const client1 = em.create(MonthlyClient, {
            name: 'Juan Perez',
            plate: 'ABC-123',
            phone: '3001234567',
            vehicleType: 'CAR',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            monthlyRate: 80000,
            isActive: true
        });

        const client2 = em.create(MonthlyClient, {
            name: 'Maria Rodriguez',
            plate: 'XYZ-789',
            phone: '3109876543',
            vehicleType: 'MOTORCYCLE',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            monthlyRate: 40000,
            isActive: true
        });
        await em.persistAndFlush([client1, client2]);

        console.log('🚗 Creating Parking Sessions...');
        const sessions = [];

        // 1. Car parked by hour, > 1 hour duration (Active)
        // Entry time: 2 hours ago
        const carHourEntry = new Date();
        carHourEntry.setHours(carHourEntry.getHours() - 2);

        sessions.push(em.create(ParkingSession, {
            plate: 'CAR-001',
            vehicleType: VehicleType.CAR,
            planType: PlanType.HOUR,
            entryTime: carHourEntry,
            status: ParkingStatus.ACTIVE,
            entryShift: shift,
        }));

        // 2. Car parked by day (Active)
        // Entry time: 5 hours ago
        const carDayEntry = new Date();
        carDayEntry.setHours(carDayEntry.getHours() - 5);

        sessions.push(em.create(ParkingSession, {
            plate: 'CAR-002',
            vehicleType: VehicleType.CAR,
            planType: PlanType.DAY,
            entryTime: carDayEntry,
            status: ParkingStatus.ACTIVE,
            entryShift: shift,
        }));

        // 3. Moto parked by hour, < 1 hour (Active)
        // Entry time: 30 minutes ago
        const motoHourEntry = new Date();
        motoHourEntry.setMinutes(motoHourEntry.getMinutes() - 30);

        sessions.push(em.create(ParkingSession, {
            plate: 'MOT-001',
            vehicleType: VehicleType.MOTORCYCLE,
            planType: PlanType.HOUR,
            entryTime: motoHourEntry,
            status: ParkingStatus.ACTIVE,
            entryShift: shift,
        }));

        await em.persistAndFlush(sessions); // Flush all pending

        console.log('✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await orm.close();
    }
};

seed();
