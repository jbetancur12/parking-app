"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSessions = exports.exitVehicle = exports.entryVehicle = void 0;
const core_1 = require("@mikro-orm/core");
const ParkingSession_1 = require("../entities/ParkingSession");
const Shift_1 = require("../entities/Shift");
const entryVehicle = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    const { plate, vehicleType, notes } = req.body;
    if (!plate || !vehicleType) {
        return res.status(400).json({ message: 'Plate and Vehicle Type are required' });
    }
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
        entryTime: new Date(),
        status: ParkingSession_1.ParkingStatus.ACTIVE,
        entryShift: shift,
        notes,
    });
    await em.persistAndFlush(session);
    return res.status(201).json(session);
};
exports.entryVehicle = entryVehicle;
const exitVehicle = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    const { plate } = req.body;
    if (!plate) {
        return res.status(400).json({ message: 'Plate is required' });
    }
    // Find active shift
    const shift = await em.findOne(Shift_1.Shift, {
        user: req.user.id,
        isActive: true,
    });
    if (!shift) {
        return res.status(400).json({ message: 'No active shift found. Open a shift first.' });
    }
    // Find active session
    const session = await em.findOne(ParkingSession_1.ParkingSession, {
        plate,
        status: ParkingSession_1.ParkingStatus.ACTIVE,
    });
    if (!session) {
        return res.status(404).json({ message: 'No active parking session found for this plate' });
    }
    // Calculate duration and cost (simplified logic for now)
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - session.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    // Dummy rate: $100 per minute
    const rate = 100;
    const cost = durationMinutes * rate;
    session.exitTime = exitTime;
    session.cost = cost;
    session.status = ParkingSession_1.ParkingStatus.COMPLETED;
    session.exitShift = shift;
    // Update shift income? Ideally yes, but depends on payment flow.
    // We'll update shift.totalIncome later properly or via Transaction entity.
    // For now, let's create a Transaction.
    // Actually, let's keep it simple for this phase: Just close the session.
    await em.flush();
    return res.json({ session, cost, durationMinutes });
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
