"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByShift = void 0;
const core_1 = require("@mikro-orm/core");
const Transaction_1 = require("../entities/Transaction");
const getByShift = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em)
        return res.status(500).json({ message: 'Internal Server Error' });
    const { shiftId } = req.params;
    try {
        const transactions = await em.find(Transaction_1.Transaction, { shift: Number(shiftId) }, { orderBy: { timestamp: 'DESC' } });
        res.json(transactions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};
exports.getByShift = getByShift;
