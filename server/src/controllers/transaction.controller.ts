import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Transaction } from '../entities/Transaction';
import { AuditService } from '../services/AuditService';
import { User } from '../entities/User';

export const getByShift = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    const { shiftId } = req.params;

    try {
        const transactions = await em.find(Transaction,
            { shift: Number(shiftId) },
            { orderBy: { timestamp: 'DESC' } }
        );

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

export const deleteTransaction = async (req: Request, res: Response) => {
    const em = RequestContext.getEntityManager();
    const { id } = req.params;
    const authReq = req as any; // To get user
    const currentUser = authReq.user as User;

    if (!em) return res.status(500).json({ message: 'Internal Server Error' });

    try {
        const transaction = await em.findOne(Transaction, { id: Number(id) });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Save details for audit before deletion
        const details = {
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            shiftId: transaction.shift?.id
        };

        // Delete
        em.remove(transaction);
        await em.flush();

        // Audit
        if (currentUser) {
            await AuditService.log(
                em,
                'DELETE',
                'Transaction',
                id,
                currentUser,
                details,
                req
            );
        }

        res.json({ message: 'Transaction deleted and audited' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};
