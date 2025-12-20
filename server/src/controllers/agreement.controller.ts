import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Agreement } from '../entities/Agreement';

export class AgreementController {
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const agreements = await em.find(Agreement, {}, { orderBy: { name: 'ASC' } });
            res.json(agreements);
        } catch (error) {
            console.error('Error fetching agreements:', error);
            res.status(500).json({ message: 'Error fetching agreements' });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const agreements = await em.find(Agreement, { isActive: true }, { orderBy: { name: 'ASC' } });
            res.json(agreements);
        } catch (error) {
            console.error('Error fetching active agreements:', error);
            res.status(500).json({ message: 'Error fetching active agreements' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { name, type, value, description } = req.body;

            const agreement = em.create(Agreement, {
                name,
                type,
                value,
                description,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await em.persistAndFlush(agreement);
            res.status(201).json(agreement);
        } catch (error) {
            console.error('Error creating agreement:', error);
            res.status(500).json({ message: 'Error creating agreement' });
        }
    }

    async toggleStatus(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { id } = req.params;
            const agreement = await em.findOne(Agreement, { id: Number(id) });

            if (!agreement) {
                return res.status(404).json({ message: 'Agreement not found' });
            }

            agreement.isActive = !agreement.isActive;
            await em.persistAndFlush(agreement);

            res.json(agreement);
        } catch (error) {
            console.error('Error toggling agreement status:', error);
            res.status(500).json({ message: 'Error updating agreement' });
        }
    }
}
