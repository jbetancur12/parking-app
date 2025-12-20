import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Transaction } from '../entities/Transaction';

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
