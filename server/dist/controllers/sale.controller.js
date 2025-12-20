"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleController = void 0;
const core_1 = require("@mikro-orm/core");
const Transaction_1 = require("../entities/Transaction");
const Shift_1 = require("../entities/Shift");
class SaleController {
    async create(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const { description, amount } = req.body;
            const numericAmount = Number(amount);
            if (!description || !numericAmount || numericAmount <= 0) {
                return res.status(400).json({ message: 'Invalid description or amount' });
            }
            // Find active shift
            const activeShift = await em.findOne(Shift_1.Shift, { endTime: null });
            if (!activeShift) {
                return res.status(400).json({ message: 'No active shift found. Please start a shift first.' });
            }
            const transaction = em.create(Transaction_1.Transaction, {
                shift: activeShift,
                type: Transaction_1.TransactionType.INCOME,
                description: description,
                amount: numericAmount,
                timestamp: new Date()
            });
            await em.persistAndFlush(transaction);
            res.status(201).json(transaction);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error registering sale' });
        }
    }
    async getAllByShift(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const { shiftId } = req.params;
            const transactions = await em.find(Transaction_1.Transaction, {
                shift: Number(shiftId),
                type: Transaction_1.TransactionType.INCOME
            }, { orderBy: { timestamp: 'DESC' } });
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching sales' });
        }
    }
}
exports.SaleController = SaleController;
