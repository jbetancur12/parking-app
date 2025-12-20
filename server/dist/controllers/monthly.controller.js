"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyClientController = void 0;
const core_1 = require("@mikro-orm/core");
const MonthlyClient_1 = require("../entities/MonthlyClient");
const Transaction_1 = require("../entities/Transaction");
const Shift_1 = require("../entities/Shift");
const MonthlyPayment_1 = require("../entities/MonthlyPayment");
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
            // Check if there's already an active client with this plate
            const existingActive = await em.findOne(MonthlyClient_1.MonthlyClient, {
                plate,
                isActive: true
            });
            if (existingActive) {
                return res.status(400).json({ message: 'Ya existe un cliente activo con esta placa' });
            }
            const startDate = new Date();
            const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
            const client = em.create(MonthlyClient_1.MonthlyClient, {
                plate,
                name,
                phone,
                vehicleType,
                monthlyRate: monthlyRate || 0,
                startDate,
                endDate,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Create initial payment record
            const payment = em.create(MonthlyPayment_1.MonthlyPayment, {
                client,
                periodStart: startDate,
                periodEnd: endDate,
                amount: monthlyRate || 0,
                paymentDate: new Date()
            });
            em.persist([client, payment]);
            await em.flush();
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
            const { amount, paymentMethod } = req.body; // Allow overriding amount and payment method
            const client = await em.findOne(MonthlyClient_1.MonthlyClient, { id: Number(id) });
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            // Logic: Add 1 month to the current end date (or today if expired)
            const baseDate = client.endDate > new Date() ? client.endDate : new Date();
            const newEndDate = new Date(baseDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            const oldEndDate = client.endDate;
            client.endDate = newEndDate;
            client.isActive = true;
            // Create payment record
            const payment = em.create(MonthlyPayment_1.MonthlyPayment, {
                client,
                periodStart: baseDate,
                periodEnd: newEndDate,
                amount: amount || client.monthlyRate,
                paymentDate: new Date()
            });
            em.persist(payment);
            // Create Transaction
            // Need active shift to link transaction
            const activeShift = await em.findOne(Shift_1.Shift, { endTime: null });
            // Create transaction
            if (activeShift) {
                const transaction = em.create(Transaction_1.Transaction, {
                    shift: activeShift,
                    type: Transaction_1.TransactionType.MONTHLY_PAYMENT,
                    description: `Mensualidad: ${client.name} (${client.plate})`,
                    amount: amount || client.monthlyRate,
                    paymentMethod: paymentMethod || Transaction_1.PaymentMethod.CASH, // Default to CASH
                    timestamp: new Date()
                });
                em.persist(transaction);
            }
            else {
                console.warn('Renewing monthly without active shift');
                // We must have a shift
                if (!activeShift) {
                    return res.status(400).json({ message: 'No active shift found. Please start a shift to renew.' });
                }
            }
            await em.flush();
            res.json(client);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error renewing subscription' });
        }
    }
    // Get client history
    async getHistory(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager found' });
            const { id } = req.params;
            const client = await em.findOne(MonthlyClient_1.MonthlyClient, { id: Number(id) });
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            const payments = await em.find(MonthlyPayment_1.MonthlyPayment, {
                client: client.id
            }, { orderBy: { paymentDate: 'DESC' } });
            res.json(payments);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching history' });
        }
    }
}
exports.MonthlyClientController = MonthlyClientController;
