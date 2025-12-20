"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSessions = exports.exitVehicle = exports.previewExit = exports.entryVehicle = void 0;
const core_1 = require("@mikro-orm/core");
const ParkingSession_1 = require("../entities/ParkingSession");
const Shift_1 = require("../entities/Shift");
const Tariff_1 = require("../entities/Tariff");
const SystemSetting_1 = require("../entities/SystemSetting");
const Transaction_1 = require("../entities/Transaction");
const calculateParkingCost = (session, tariffs, gracePeriod) => {
    // Map tariffs for easy access
    const rateMap = {};
    tariffs.forEach(t => rateMap[t.tariffType] = Number(t.cost));
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - session.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    let cost = 0;
    if (session.planType === ParkingSession_1.PlanType.DAY) {
        const days = Math.ceil(durationMinutes / 1440);
        cost = days * (rateMap['DAY'] || 15000);
    }
    else {
        const hourRate = rateMap['HOUR'] || 3000;
        const fullHours = Math.floor(durationMinutes / 60);
        const remainderMinutes = durationMinutes % 60;
        let chargeableHours = fullHours;
        if (remainderMinutes > gracePeriod) {
            chargeableHours += 1;
        }
        if (chargeableHours === 0) {
            chargeableHours = 1;
        }
        cost = chargeableHours * hourRate;
    }
    return { cost, durationMinutes, exitTime };
};
const entryVehicle = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    const { plate, vehicleType, planType, notes } = req.body;
    if (!plate || !vehicleType) {
        return res.status(400).json({ message: 'Plate and Vehicle Type are required' });
    }
    // Default plan to HOUR if not provided
    const selectedPlan = planType || ParkingSession_1.PlanType.HOUR;
    // Find active shift for user
    const shift = await em.findOne(Shift_1.Shift, {
        user: req.user.id,
        isActive: true,
    });
    if (!shift) {
        return res.status(400).json({ message: 'No active shift found. Open a shift first.' });
    }
    // Check for existing active session for this plate
    const existingSession = await em.findOne(ParkingSession_1.ParkingSession, {
        plate,
        status: ParkingSession_1.ParkingStatus.ACTIVE,
    });
    if (existingSession) {
        return res.status(400).json({ message: 'Vehicle already parked', session: existingSession });
    }
    const session = em.create(ParkingSession_1.ParkingSession, {
        plate,
        vehicleType: vehicleType,
        planType: selectedPlan,
        entryTime: new Date(),
        status: ParkingSession_1.ParkingStatus.ACTIVE,
        entryShift: shift,
        notes,
    });
    await em.persistAndFlush(session);
    return res.status(201).json(session);
};
exports.entryVehicle = entryVehicle;
const previewExit = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em)
        return res.status(500).json({ message: 'Internal Server Error' });
    const { plate } = req.params;
    const session = await em.findOne(ParkingSession_1.ParkingSession, {
        plate,
        status: ParkingSession_1.ParkingStatus.ACTIVE,
    });
    if (!session) {
        return res.status(404).json({ message: 'No active session' });
    }
    const tariffs = await em.find(Tariff_1.Tariff, { vehicleType: session.vehicleType });
    const settingsList = await em.find(SystemSetting_1.SystemSetting, {});
    const settings = {};
    settingsList.forEach(s => settings[s.key] = s.value);
    const gracePeriod = Number(settings['grace_period'] || 5);
    const result = calculateParkingCost(session, tariffs, gracePeriod);
    return res.json({
        plate: session.plate,
        entryTime: session.entryTime,
        planType: session.planType,
        ...result
    });
};
exports.previewExit = previewExit;
const exitVehicle = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    const { plate } = req.body;
    if (!plate) {
        return res.status(400).json({ message: 'Plate is required' });
    }
    const shift = await em.findOne(Shift_1.Shift, {
        user: req.user.id,
        isActive: true,
    });
    if (!shift) {
        return res.status(400).json({ message: 'No active shift found' });
    }
    const session = await em.findOne(ParkingSession_1.ParkingSession, {
        plate,
        status: ParkingSession_1.ParkingStatus.ACTIVE,
    });
    if (!session) {
        return res.status(404).json({ message: 'No active parking session found for this plate' });
    }
    const tariffs = await em.find(Tariff_1.Tariff, { vehicleType: session.vehicleType });
    const settingsList = await em.find(SystemSetting_1.SystemSetting, {});
    const settings = {};
    settingsList.forEach(s => settings[s.key] = s.value);
    const gracePeriod = Number(settings['grace_period'] || 5);
    const { cost, durationMinutes, exitTime } = calculateParkingCost(session, tariffs, gracePeriod);
    session.exitTime = exitTime;
    session.cost = cost;
    session.status = ParkingSession_1.ParkingStatus.COMPLETED;
    session.exitShift = shift;
    // Create Revenue Transaction
    const transaction = em.create(Transaction_1.Transaction, {
        shift: shift,
        type: Transaction_1.TransactionType.PARKING_REVENUE,
        description: `Parking [${session.planType}]: ${session.plate} (${Math.floor(durationMinutes)} mins)`,
        amount: cost,
        timestamp: new Date()
    });
    em.persist(transaction);
    await em.flush();
    // Return all data needed for printing
    return res.json({
        id: session.id,
        plate: session.plate,
        vehicleType: session.vehicleType,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        planType: session.planType,
        cost,
        durationMinutes
    });
};
exports.exitVehicle = exitVehicle;
const getActiveSessions = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em)
        return res.status(500).json({ message: 'Internal error' });
    const sessions = await em.find(ParkingSession_1.ParkingSession, { status: ParkingSession_1.ParkingStatus.ACTIVE }, { orderBy: { entryTime: 'DESC' } });
    return res.json(sessions);
};
exports.getActiveSessions = getActiveSessions;
