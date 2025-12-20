"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportData = void 0;
const core_1 = require("@mikro-orm/core");
const User_1 = require("../entities/User");
const Tariff_1 = require("../entities/Tariff");
const Shift_1 = require("../entities/Shift");
const Transaction_1 = require("../entities/Transaction");
const SystemSetting_1 = require("../entities/SystemSetting");
const Brand_1 = require("../entities/Brand");
const MonthlyClient_1 = require("../entities/MonthlyClient");
const Expense_1 = require("../entities/Expense");
const WashEntry_1 = require("../entities/WashEntry");
const exportData = async (req, res) => {
    const em = core_1.RequestContext.getEntityManager();
    if (!em)
        return res.status(500).json({ message: 'Internal Server Error' });
    try {
        // Fetch all data from key entities
        // Removed AdditionalIncome and WashService as they likely don't exist or are handled differently
        // Replaced Client with MonthlyClient
        // Replaced WashService with WashEntry
        const [users, tariffs, shifts, transactions, settings, brands, monthlyClients, expenses, washEntries] = await Promise.all([
            em.find(User_1.User, {}),
            em.find(Tariff_1.Tariff, {}),
            em.find(Shift_1.Shift, {}),
            em.find(Transaction_1.Transaction, {}),
            em.find(SystemSetting_1.SystemSetting, {}),
            em.find(Brand_1.Brand, {}),
            em.find(MonthlyClient_1.MonthlyClient, {}),
            em.find(Expense_1.Expense, {}),
            em.find(WashEntry_1.WashEntry, {})
        ]);
        const backupData = {
            metadata: {
                version: '1.0',
                date: new Date().toISOString(),
                server: 'ParkingApp v1.0'
            },
            data: {
                users,
                tariffs,
                shifts,
                transactions,
                settings,
                brands,
                monthlyClients,
                expenses,
                washEntries
            }
        };
        const fileName = `backup-${new Date().toISOString().split('T')[0]}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.json(backupData);
    }
    catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ message: 'Error creating backup' });
    }
};
exports.exportData = exportData;
