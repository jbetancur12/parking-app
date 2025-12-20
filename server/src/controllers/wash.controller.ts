import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { WashEntry } from '../entities/WashEntry';
import { WashServiceType } from '../entities/WashServiceType';
import { Shift } from '../entities/Shift';
import { Transaction, TransactionType } from '../entities/Transaction';

export class WashController {

    async getServiceTypes(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const types = await em.find(WashServiceType, { isActive: true });
            res.json(types);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching services' });
        }
    }

    async createEntry(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { plate, serviceTypeId, operatorName, shiftId, price } = req.body;

            const shift = await em.findOne(Shift, { id: Number(shiftId) });
            if (!shift || !shift.isActive) return res.status(400).json({ message: 'Shift closed or invalid' });

            const serviceType = await em.findOne(WashServiceType, { id: Number(serviceTypeId) });
            if (!serviceType) return res.status(404).json({ message: 'Service type not found' });

            // Use provided price (override) or default to serviceType price
            const finalPrice = price ? Number(price) : serviceType.price;

            const washEntry = em.create(WashEntry, {
                plate: plate.toUpperCase(),
                serviceType,
                shift,
                operatorName,
                cost: finalPrice,
                status: 'Completed',
                createdAt: new Date()
            });

            // Financial Transaction
            const transaction = em.create(Transaction, {
                shift,
                type: TransactionType.WASH_SERVICE, // Wash service
                amount: finalPrice,
                description: `Lavado: ${serviceType.name} (${plate})`,
                timestamp: new Date()
            });

            em.persist([washEntry, transaction]);
            await em.flush();

            res.status(201).json(washEntry);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating wash entry' });
        }
    }

    async getAllByShift(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { shiftId } = req.params;
            // Fetch wash entries, maybe populate serviceType if needed
            const entries = await em.find(WashEntry, { shift: Number(shiftId) }, {
                orderBy: { createdAt: 'DESC' },
                populate: ['serviceType']
            });

            res.json(entries);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching wash entries' });
        }
    }

    // Temporary seed for testing
    async seedServices(req: Request, res: Response) {
        const em = RequestContext.getEntityManager();
        if (!em) return;

        const count = await em.count(WashServiceType, {});
        if (count === 0) {
            const defaults = [
                { name: 'Lavado General Moto', price: 15000, vehicleType: 'Moto', isActive: true },
                { name: 'Lavado General Carro', price: 25000, vehicleType: 'Carro', isActive: true },
                { name: 'Polichado Moto', price: 25000, vehicleType: 'Moto', isActive: true },
                { name: 'Polichado Carro', price: 40000, vehicleType: 'Carro', isActive: true },
            ];

            defaults.forEach(d => em.persist(em.create(WashServiceType, d)));
            await em.flush();
        }
        res.json({ message: 'Seeded' });
    }
}
