import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Tariff } from '../entities/Tariff';
import { Shift } from '../entities/Shift';
import { Transaction } from '../entities/Transaction';
import { SystemSetting } from '../entities/SystemSetting';
import { Brand } from '../entities/Brand';
import { MonthlyClient } from '../entities/MonthlyClient';
import { Expense } from '../entities/Expense';
import { WashEntry } from '../entities/WashEntry';

export const exportData = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    try {
        // Fetch all data from key entities
        // Removed AdditionalIncome and WashService as they likely don't exist or are handled differently
        // Replaced Client with MonthlyClient
        // Replaced WashService with WashEntry

        const [
            users,
            tariffs,
            shifts,
            transactions,
            settings,
            brands,
            monthlyClients,
            expenses,
            washEntries
        ] = await Promise.all([
            em.find(User, {}),
            em.find(Tariff, {}),
            em.find(Shift, {}),
            em.find(Transaction, {}),
            em.find(SystemSetting, {}),
            em.find(Brand, {}),
            em.find(MonthlyClient, {}),
            em.find(Expense, {}),
            em.find(WashEntry, {})
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

    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ message: 'Error creating backup' });
    }
};
