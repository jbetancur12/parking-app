import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Brand } from '../entities/Brand';

export class BrandController {

    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const brands = await em.find(Brand, {}, { orderBy: { name: 'ASC' } });
            res.json(brands);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching brands' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { name } = req.body;
            if (!name) return res.status(400).json({ message: 'Name required' });

            const exists = await em.findOne(Brand, { name });
            if (exists) return res.status(400).json({ message: 'Brand already exists' });

            const brand = em.create(Brand, {
                name,
                isActive: true,
                createdAt: new Date()
            });

            await em.persistAndFlush(brand);
            res.status(201).json(brand);
        } catch (error) {
            res.status(500).json({ message: 'Error creating brand' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { id } = req.params;
            const brand = await em.findOne(Brand, { id: Number(id) });

            if (!brand) return res.status(404).json({ message: 'Brand not found' });

            await em.removeAndFlush(brand);
            res.status(200).json({ message: 'Brand deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting brand' });
        }
    }
}
