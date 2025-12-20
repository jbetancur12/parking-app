"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const core_1 = require("@mikro-orm/core");
const Expense_1 = require("../entities/Expense");
const Shift_1 = require("../entities/Shift");
const Transaction_1 = require("../entities/Transaction");
class ExpenseController {
    async create(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager' });
            const { description, amount, shiftId } = req.body;
            const user = req.user;
            if (!description || !amount || !shiftId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const shift = await em.findOne(Shift_1.Shift, { id: Number(shiftId) });
            if (!shift) {
                return res.status(404).json({ message: 'Shift not found' });
            }
            if (!shift.isActive) {
                return res.status(400).json({ message: 'Shift is closed' });
            }
            // 1. Create Expense Record
            const expense = em.create(Expense_1.Expense, {
                description,
                amount: Number(amount),
                shift,
                createdAt: new Date()
            });
            // 2. Create Financial Transaction (Negative amount for cash flow?) 
            // Usually expenses reduce cash in hand.
            // In the legacy system, 'egresos' were just tracked. 
            // Here we treat it as an outflow.
            const transaction = em.create(Transaction_1.Transaction, {
                shift,
                type: Transaction_1.TransactionType.EXPENSE,
                amount: -Number(amount), // Negative for expense
                description: `Egreso: ${description}`,
                timestamp: new Date()
            });
            em.persist([expense, transaction]);
            await em.flush();
            res.status(201).json(expense);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating expense' });
        }
    }
    async getAllByShift(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EntityManager' });
            const { shiftId } = req.params;
            const expenses = await em.find(Expense_1.Expense, { shift: Number(shiftId) }, { orderBy: { createdAt: 'DESC' } });
            res.json(expenses);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching expenses' });
        }
    }
}
exports.ExpenseController = ExpenseController;
