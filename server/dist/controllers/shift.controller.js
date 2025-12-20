"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClosed = exports.closeShift = exports.getActiveShift = exports.openShift = void 0;
const core_1 = require("@mikro-orm/core");
const Shift_1 = require("../entities/Shift");
const Transaction_1 = require("../entities/Transaction");
const openShift = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    // Check if user already has an active shift
    const existingShift = await em.findOne(Shift_1.Shift, {
        user: req.user.id,
        isActive: true,
    });
    if (existingShift) {
        return res.status(400).json({ message: 'User already has an active shift', shift: existingShift });
    }
    const { baseAmount } = req.body;
    const shift = em.create(Shift_1.Shift, {
        user: req.user.id,
        startTime: new Date(),
        baseAmount: baseAmount || 0,
        totalIncome: 0,
        totalExpenses: 0,
        cashIncome: 0,
        transferIncome: 0,
        declaredAmount: 0,
        isActive: true,
    });
    await em.persistAndFlush(shift);
    return res.status(201).json(shift);
};
exports.openShift = openShift;
const getActiveShift = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    const shift = await em.findOne(Shift_1.Shift, {
        user: req.user.id,
        isActive: true,
    });
    if (!shift) {
        return res.status(404).json({ message: 'No active shift found' });
    }
    return res.json(shift);
};
exports.getActiveShift = getActiveShift;
const closeShift = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em || !req.user) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    const shift = await em.findOne(Shift_1.Shift, {
        user: req.user.id,
        isActive: true,
    });
    if (!shift) {
        return res.status(404).json({ message: 'No active shift found' });
    }
    const { declaredAmount, notes } = req.body;
    // Calculate totals from transactions
    const transactions = await em.find(Transaction_1.Transaction, { shift: shift.id });
    let totalIncome = 0;
    let totalExpenses = 0;
    let cashIncome = 0;
    let transferIncome = 0;
    transactions.forEach(t => {
        if (t.type === Transaction_1.TransactionType.EXPENSE) {
            totalExpenses += Math.abs(t.amount);
        }
        else {
            totalIncome += t.amount;
            // Separate by payment method
            if (t.paymentMethod === Transaction_1.PaymentMethod.CASH) {
                cashIncome += t.amount;
            }
            else if (t.paymentMethod === Transaction_1.PaymentMethod.TRANSFER) {
                transferIncome += t.amount;
            }
            else {
                // For old transactions without payment method, count as cash
                cashIncome += t.amount;
            }
        }
    });
    shift.totalIncome = totalIncome;
    shift.totalExpenses = totalExpenses;
    shift.cashIncome = cashIncome;
    shift.transferIncome = transferIncome;
    shift.isActive = false;
    shift.endTime = new Date();
    shift.declaredAmount = declaredAmount || 0;
    shift.notes = notes;
    await em.flush();
    // Return summary
    const expectedCash = shift.baseAmount + cashIncome - totalExpenses; // Only cash income counts for expected cash
    const difference = shift.declaredAmount - expectedCash;
    return res.json({
        message: 'Shift closed successfully',
        shift,
        summary: {
            baseAmount: shift.baseAmount,
            totalIncome,
            cashIncome,
            transferIncome,
            totalExpenses,
            expectedCash,
            declaredAmount: shift.declaredAmount,
            difference,
            transactionCount: transactions.length
        }
    });
};
exports.closeShift = closeShift;
const getAllClosed = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em)
        return res.status(500).json({ message: 'Internal Server Error' });
    try {
        const closedShifts = await em.find(Shift_1.Shift, { isActive: false }, {
            populate: ['user'],
            orderBy: { endTime: 'DESC' }
        });
        // Calculate summary for each shift
        const shiftsWithSummary = closedShifts.map(shift => {
            // Use stored cashIncome if available (new records), otherwise fallback or assume all is cash
            // For backward compatibility, if cashIncome is 0 and transferIncome is 0 but totalIncome > 0,
            // we might assume it was all cash (old logic) or leave it. 
            // Better to rely on the fact we just added columns so old ones are 0.
            // But old `shift.totalIncome` was calculated.
            // Re-calculating correctly:
            const effectiveCashIncome = shift.cashIncome || (shift.totalIncome - (shift.transferIncome || 0));
            const expectedCash = shift.baseAmount + effectiveCashIncome - shift.totalExpenses;
            const difference = shift.declaredAmount - expectedCash;
            return {
                id: shift.id,
                user: {
                    id: shift.user.id,
                    username: shift.user.username
                },
                startTime: shift.startTime,
                endTime: shift.endTime,
                baseAmount: shift.baseAmount,
                totalIncome: shift.totalIncome,
                cashIncome: shift.cashIncome,
                transferIncome: shift.transferIncome,
                totalExpenses: shift.totalExpenses,
                declaredAmount: shift.declaredAmount,
                expectedCash,
                difference,
                notes: shift.notes
            };
        });
        res.json(shiftsWithSummary);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching closed shifts' });
    }
};
exports.getAllClosed = getAllClosed;
