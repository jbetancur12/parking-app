"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyClientController = void 0;
const core_1 = require("@mikro-orm/core");
const MonthlyClient_1 = require("../entities/MonthlyClient");
class MonthlyClientController {
    // Get all clients
    async getAll(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            // Support basic simple search by name or plate
            const { search } = req.query;
            const where = {};
            if (search) {
                where.$or = [
                    { name: { $ilike: `%${search}%` } },
                    { plate: { $ilike: `%${search}%` } }
                ];
            }
            const clients = await em.find(MonthlyClient_1.MonthlyClient, where, { orderBy: { name: 'ASC' } });
            res.json(clients);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching clients' });
        }
    }
    // Create new client
    async create(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { plate, name, phone, vehicleType, monthlyRate } = req.body;
            const existing = await em.findOne(MonthlyClient_1.MonthlyClient, { plate });
            if (existing) {
                return res.status(400).json({ message: 'Client with this plate already exists' });
            }
            const client = em.create(MonthlyClient_1.MonthlyClient, {
                plate,
                name,
                phone,
                vehicleType,
                monthlyRate: monthlyRate || 0,
                startDate: new Date(), // Today
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // +1 Month default
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await em.persistAndFlush(client);
            res.status(201).json(client);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating client' });
        }
    }
    // Renew subscription
    async renew(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { id } = req.params;
            const client = await em.findOne(MonthlyClient_1.MonthlyClient, { id: Number(id) });
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            // Logic: Add 1 month to the current end date (or today if expired)
            const baseDate = client.endDate > new Date() ? client.endDate : new Date();
            const newEndDate = new Date(baseDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            client.endDate = newEndDate;
            client.isActive = true;
            await em.flush();
            res.json(client);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error renewing subscription' });
        }
    }
}
exports.MonthlyClientController = MonthlyClientController;
