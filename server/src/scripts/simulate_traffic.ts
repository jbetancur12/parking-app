import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { User } from '../entities/User';
import { Location } from '../entities/Location';
import { Shift } from '../entities/Shift';
import { ParkingSession, ParkingStatus, PlanType, VehicleType } from '../entities/ParkingSession';
import { Tariff } from '../entities/Tariff';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { Tenant } from '../entities/Tenant';
import { MonthlyClient } from '../entities/MonthlyClient';
import { Expense } from '../entities/Expense';
import { addDays, addMonths } from 'date-fns';

// Configuration
const TARGET_USER = 'oper.dai';
const TARGET_LOCATION = 'Sede Centro';
const TRAFFIC_INTERVAL_MS = 5 * 60 * 1000; // 5 Minutes
const MONTHLY_INTERVAL_MS = 15 * 60 * 1000; // 15 Minutes
const FINANCE_MIN_INTERVAL_MS = 10 * 60 * 1000; // 10 Minutes
const FINANCE_MAX_INTERVAL_MS = 20 * 60 * 1000; // 20 Minutes

const randomPlate = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    const l3 = letters[Math.floor(Math.random() * letters.length)];
    const n1 = numbers[Math.floor(Math.random() * numbers.length)];
    const n2 = numbers[Math.floor(Math.random() * numbers.length)];
    const n3 = numbers[Math.floor(Math.random() * numbers.length)];
    return `${l1}${l2}${l3}-${n1}${n2}${n3}`;
};

const randomName = () => {
    const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Luisa', 'Jorge', 'Sofia'];
    const lastNames = ['Perez', 'Gomez', 'Rodriguez', 'Martinez', 'Lopez', 'Garcia'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const calculateCost = (durationMinutes: number, tariffs: Tariff[], vehicleType: VehicleType, planType: PlanType) => {
    if (planType === PlanType.DAY) {
        return Number(tariffs.find(t => t.tariffType === 'DAY' && t.vehicleType === vehicleType)?.cost || 15000);
    }
    const hourRate = Number(tariffs.find(t => t.tariffType === 'HOUR' && t.vehicleType === vehicleType)?.cost || 3000);
    const hours = Math.ceil(durationMinutes / 60);
    return hours * hourRate;
};

const main = async () => {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    // 1. Initial Setup
    console.log(`🤖 Base initialization...`);
    const user = await em.findOne(User, { username: TARGET_USER }, { populate: ['tenants', 'locations'] });
    if (!user) throw new Error(`User ${TARGET_USER} not found`);

    const location = user.locations.getItems().find(l => l.name.includes(TARGET_LOCATION));
    if (!location) throw new Error(`Location ${TARGET_LOCATION} not found`);

    const tenant = user.tenants.getItems()[0];
    if (!tenant) throw new Error(`Tenant not found`);

    // Ensure Shift
    let shift = await em.findOne(Shift, { user: user.id, location: location.id, isActive: true });
    if (!shift) {
        shift = em.create(Shift, {
            user, location, tenant, startTime: new Date(), isActive: true, baseAmount: 500000,
            totalIncome: 0, totalExpenses: 0, cashIncome: 0, transferIncome: 0, declaredAmount: 0
        });
        await em.persistAndFlush(shift);
        console.log(`✅ Opened Shift #${shift.id}`);
    }

    const tariffs = await em.find(Tariff, { location: location.id });
    if (tariffs.length === 0) console.log('⚠️ Using default tariffs.');

    console.log(`🚀 Simulator Started for ${TARGET_USER} @ ${TARGET_LOCATION}`);
    console.log(`   - Traffic: Every 5 mins`);
    console.log(`   - Monthly: Every 15 mins`);
    console.log(`   - Finance: Every 10-20 mins`);

    // --- LOOPS ---

    // 1. TRAFFIC LOOP
    const runTraffic = async () => {
        const forkEm = orm.em.fork();
        const currentShift = await forkEm.findOne(Shift, { id: shift!.id });
        if (!currentShift?.isActive) { console.log('❌ Shift Closed. Stopping.'); process.exit(0); }

        const action = Math.random() > 0.5 ? 'ENTRY' : 'EXIT';

        if (action === 'ENTRY') {
            const plate = randomPlate();
            const vehicleType = Math.random() > 0.3 ? VehicleType.CAR : VehicleType.MOTORCYCLE;
            const planType = Math.random() > 0.8 ? PlanType.DAY : PlanType.HOUR;

            const session = forkEm.create(ParkingSession, {
                plate, vehicleType, planType,
                entryTime: new Date(), status: ParkingStatus.ACTIVE,
                entryShift: currentShift as any,
                tenant: tenant as any,
                location: location as any,
                notes: 'Simulated Entry'
            });
            await forkEm.persistAndFlush(session);
            console.log(`[TRAFFIC] 🚗 ENTRY: ${plate} (${vehicleType} - ${planType})`);
        } else {
            const sessions = await forkEm.find(ParkingSession, { location: location.id, status: ParkingStatus.ACTIVE });
            if (sessions.length > 0) {
                const session = sessions[Math.floor(Math.random() * sessions.length)];
                // Simulate duration (30 mins to 5 hours)
                const duration = Math.floor(Math.random() * 270) + 30;
                session.entryTime = new Date(Date.now() - duration * 60000);
                session.exitTime = new Date();

                const cost = calculateCost(duration, tariffs, session.vehicleType, session.planType);
                session.cost = cost;
                session.status = ParkingStatus.COMPLETED;
                session.exitShift = currentShift as any;

                const tx = forkEm.create(Transaction, {
                    shift: currentShift as any,
                    tenant: tenant as any,
                    location: location as any,
                    type: TransactionType.PARKING_REVENUE,
                    description: `Exit: ${session.plate} (${duration}m)`,
                    amount: cost, paymentMethod: PaymentMethod.CASH, timestamp: new Date(),
                    discount: 0
                });

                await forkEm.persistAndFlush([session, tx]);
                console.log(`[TRAFFIC] 💰 EXIT: ${session.plate} - Paid $${cost}`);
            } else {
                console.log(`[TRAFFIC] No cars to exit.`);
            }
        }
    };

    // 2. MONTHLY CLIENT LOOP
    const runMonthly = async () => {
        const forkEm = orm.em.fork();
        const currentShift = await forkEm.findOne(Shift, { id: shift!.id });
        if (!currentShift) return;

        const plate = randomPlate();
        const client = forkEm.create(MonthlyClient, {
            name: randomName(),
            plate,
            vehicleType: 'CAR',
            startDate: new Date(),
            endDate: addMonths(new Date(), 1),
            monthlyRate: 80000,
            isActive: true,
            tenant: tenant as any,
            location: location as any,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const tx = forkEm.create(Transaction, {
            shift: currentShift as any,
            tenant: tenant as any,
            location: location as any,
            type: TransactionType.MONTHLY_PAYMENT,
            description: `Mensualidad: ${plate}`,
            amount: 80000, paymentMethod: PaymentMethod.TRANSFER, timestamp: new Date(),
            discount: 0
        });

        await forkEm.persistAndFlush([client, tx]);
        console.log(`[MONTHLY] 📅 New Client: ${client.name} (${plate}) - $80.000`);
    };

    // 3. FINANCE LOOP
    const runFinance = async () => {
        const forkEm = orm.em.fork();
        const currentShift = await forkEm.findOne(Shift, { id: shift!.id });
        if (!currentShift) return;

        const isIncome = Math.random() > 0.5;
        const amount = Math.floor(Math.random() * 50) * 1000 + 5000; // 5k to 55k

        if (isIncome) {
            const tx = forkEm.create(Transaction, {
                shift: currentShift as any,
                tenant: tenant as any,
                location: location as any,
                type: TransactionType.INCOME,
                description: `Ingreso Varios: Venta de productos`,
                amount, paymentMethod: PaymentMethod.CASH, timestamp: new Date(),
                discount: 0
            });
            await forkEm.persistAndFlush(tx);
            console.log(`[FINANCE] 💵 Income: $${amount}`);
        } else {
            const expense = forkEm.create(Expense, {
                shift: currentShift as any,
                tenant: tenant as any,
                location: location as any,
                description: `Gasto Varios: Insumos de aseo`,
                amount,
                createdAt: new Date()
            });
            const tx = forkEm.create(Transaction, {
                shift: currentShift as any,
                tenant: tenant as any,
                location: location as any,
                type: TransactionType.EXPENSE,
                description: `Gasto: Insumos de aseo`,
                amount, paymentMethod: PaymentMethod.CASH, timestamp: new Date(),
                discount: 0
            });
            await forkEm.persistAndFlush([expense, tx]);
            console.log(`[FINANCE] 💸 Expense: $${amount}`);
        }

        // Reschedule Finance (Random Interval)
        const nextTime = Math.floor(Math.random() * (FINANCE_MAX_INTERVAL_MS - FINANCE_MIN_INTERVAL_MS + 1)) + FINANCE_MIN_INTERVAL_MS;
        setTimeout(runFinance, nextTime);
    };

    // Start Scheduling
    setInterval(runTraffic, TRAFFIC_INTERVAL_MS);
    setInterval(runMonthly, MONTHLY_INTERVAL_MS);
    setTimeout(runFinance, FINANCE_MIN_INTERVAL_MS);

    // Initial Burst (Run once immediately to verify)
    await runTraffic();
};

main();
