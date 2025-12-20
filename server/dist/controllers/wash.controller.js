"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WashController = void 0;
const core_1 = require("@mikro-orm/core");
const WashEntry_1 = require("../entities/WashEntry");
const WashServiceType_1 = require("../entities/WashServiceType");
const Shift_1 = require("../entities/Shift");
const Transaction_1 = require("../entities/Transaction");
class WashController {
    async getServiceTypes(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const types = await em.find(WashServiceType_1.WashServiceType, { isActive: true });
            res.json(types);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching services' });
        }
    }
    async createEntry(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const { plate, serviceTypeId, operatorName, shiftId, price } = req.body;
            const shift = await em.findOne(Shift_1.Shift, { id: Number(shiftId) });
            if (!shift || !shift.isActive)
                return res.status(400).json({ message: 'Shift closed or invalid' });
            const serviceType = await em.findOne(WashServiceType_1.WashServiceType, { id: Number(serviceTypeId) });
            if (!serviceType)
                return res.status(404).json({ message: 'Service type not found' });
            // Use provided price (override) or default to serviceType price
            const finalPrice = price ? Number(price) : serviceType.price;
            const washEntry = em.create(WashEntry_1.WashEntry, {
                plate: plate.toUpperCase(),
                serviceType,
                shift,
                operatorName,
                cost: finalPrice,
                status: 'Completed',
                createdAt: new Date()
            });
            // Financial Transaction
            const transaction = em.create(Transaction_1.Transaction, {
                shift,
                type: Transaction_1.TransactionType.WASH_SERVICE, // Wash service
                amount: finalPrice,
                description: `Lavado: ${serviceType.name} (${plate})`,
                timestamp: new Date()
            });
            em.persist([washEntry, transaction]);
            await em.flush();
            res.status(201).json(washEntry);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating wash entry' });
        }
    }
    async getAllByShift(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const { shiftId } = req.params;
            // Fetch wash entries, maybe populate serviceType if needed
            const entries = await em.find(WashEntry_1.WashEntry, { shift: Number(shiftId) }, {
                orderBy: { createdAt: 'DESC' },
                populate: ['serviceType']
            });
            res.json(entries);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching wash entries' });
        }
    }
    // Temporary seed for testing
    async seedServices(req, res) {
        const em = core_1.RequestContext.getEntityManager();
        if (!em)
            return;
        const count = await em.count(WashServiceType_1.WashServiceType, {});
        if (count === 0) {
            const defaults = [
                { name: 'Lavado General Moto', price: 15000, vehicleType: 'Moto', isActive: true },
                { name: 'Lavado General Carro', price: 25000, vehicleType: 'Carro', isActive: true },
                { name: 'Polichado Moto', price: 25000, vehicleType: 'Moto', isActive: true },
                { name: 'Polichado Carro', price: 40000, vehicleType: 'Carro', isActive: true },
            ];
            defaults.forEach(d => em.persist(em.create(WashServiceType_1.WashServiceType, d)));
            await em.flush();
        }
        res.json({ message: 'Seeded' });
    }
}
exports.WashController = WashController;
