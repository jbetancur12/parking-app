import 'dotenv/config';
import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Tenant } from '../entities/Tenant';
import { User } from '../entities/User';
import { Location } from '../entities/Location';
import { Shift } from '../entities/Shift';
import { ParkingSession, ParkingStatus, VehicleType, PlanType } from '../entities/ParkingSession';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import config from '../mikro-orm.config';
import { subMinutes, addMinutes } from 'date-fns';

async function seedActivity() {
    console.log('🌱 Starting Activity Seed (TS Mode Final + Active)...');

    const TENANT_ID = '9a46f0c4-4c23-4654-bee3-0bf973cc94be';
    const LOCATION_ID = '6621dfd4-f1eb-4dae-afb9-c2ceaeb90aa8';
    const SHIFT_ID = 3;

    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        console.log(`📍 Using specific Shift ID: ${SHIFT_ID}`);

        const tenant = await em.findOne(Tenant, { id: TENANT_ID }, { filters: false });
        const location = await em.findOne(Location, { id: LOCATION_ID }, { filters: false });
        const shift = await em.findOne(Shift, { id: SHIFT_ID }, { filters: false });

        if (!tenant || !location || !shift) {
            throw new Error(`Missing Context!`);
        }

        const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
        const randomPlate = () => {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const l = letters[Math.floor(Math.random() * letters.length)] +
                letters[Math.floor(Math.random() * letters.length)] +
                letters[Math.floor(Math.random() * letters.length)];
            const n = Math.floor(Math.random() * 900) + 100;
            return `${l}${n}`;
        }

        // 1. COMPLETED SESSIONS (Historical)
        console.log('Inserting Completed Vehicles...');
        const completedVehicles = [
            ...Array(10).fill({ type: VehicleType.MOTORCYCLE, rate: 3000 }),
            ...Array(5).fill({ type: VehicleType.CAR, rate: 6000 })
        ];

        for (const v of completedVehicles) {
            const minutesBack = randomInt(30, 180);
            const entryTime = subMinutes(new Date(), minutesBack);
            const duration = randomInt(15, 120);
            const exitTime = addMinutes(entryTime, duration);
            if (exitTime > new Date()) continue;

            const cost = Math.ceil((duration / 60)) * v.rate;

            const session = em.create(ParkingSession, {
                tenant,
                location,
                entryShift: shift,
                exitShift: shift,
                plate: randomPlate(),
                vehicleType: v.type,
                planType: PlanType.HOUR,
                status: ParkingStatus.COMPLETED,
                entryTime,
                exitTime,
                cost,
                notes: 'Seeded auto (Completed)'
            } as any);

            const tx = em.create(Transaction, {
                tenant,
                location,
                shift,
                type: TransactionType.PARKING_REVENUE,
                amount: cost,
                description: `Parking[HOUR]: ${session.plate} (${duration} mins)`,
                paymentMethod: Math.random() > 0.3 ? PaymentMethod.CASH : PaymentMethod.TRANSFER,
                timestamp: exitTime
            } as any);

            em.persist([session, tx]);
        }

        // 2. ACTIVE SESSIONS (Currently in parking)
        console.log('Inserting Active Vehicles...');
        const activeVehicles = [
            { type: VehicleType.CAR },
            { type: VehicleType.CAR },
            { type: VehicleType.MOTORCYCLE },
            { type: VehicleType.MOTORCYCLE },
            { type: VehicleType.MOTORCYCLE }
        ];

        for (const v of activeVehicles) {
            // Entered recently (10 to 60 mins ago)
            const minutesBack = randomInt(10, 60);
            const entryTime = subMinutes(new Date(), minutesBack);

            const session = em.create(ParkingSession, {
                tenant,
                location,
                entryShift: shift,
                // No exit info
                plate: randomPlate(),
                vehicleType: v.type,
                planType: PlanType.HOUR,
                status: ParkingStatus.ACTIVE,
                entryTime,
                notes: 'Seeded auto (Active)'
            } as any);

            em.persist(session);
        }

        // 3. WASHES
        console.log('Inserting Washes...');
        for (let i = 0; i < 3; i++) {
            const time = subMinutes(new Date(), randomInt(10, 150));
            const amount = [15000, 25000, 40000][randomInt(0, 2)];
            const tx = em.create(Transaction, {
                tenant,
                location,
                shift,
                type: TransactionType.WASH_SERVICE,
                amount,
                description: `Lavado General - ${randomPlate()}`,
                paymentMethod: PaymentMethod.CASH,
                timestamp: time
            } as any);
            em.persist(tx);
        }

        // 4. EXPENSES
        console.log('Inserting Expenses...');
        const expenses = [
            { desc: 'Compra Jabón', amount: 12000 },
            { desc: 'Almuerzo Auxiliar', amount: 15000 }
        ];
        for (const exp of expenses) {
            const time = subMinutes(new Date(), randomInt(20, 160));
            const tx = em.create(Transaction, {
                tenant,
                location,
                shift,
                type: TransactionType.EXPENSE,
                amount: exp.amount,
                description: exp.desc,
                paymentMethod: PaymentMethod.CASH, // Fixed: Added paymentMethod
                timestamp: time
            } as any);
            em.persist(tx);
        }

        // 5. MISC INCOME
        console.log('Inserting Misc Income...');
        const time = subMinutes(new Date(), 60);
        const income = em.create(Transaction, {
            tenant,
            location,
            shift,
            type: TransactionType.INCOME,
            amount: 5000,
            description: 'Venta Bebida',
            paymentMethod: PaymentMethod.CASH,
            timestamp: time
        } as any);
        em.persist(income);

        await em.flush();
        console.log('✅ Seed Completed Successfully (Active + Completed)!');
        await orm.close();
    } catch (e) {
        console.error('❌ Error Seeding:', e);
    }
}

seedActivity();
