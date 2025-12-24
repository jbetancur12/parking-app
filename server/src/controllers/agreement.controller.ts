import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Agreement } from '../entities/Agreement';

export class AgreementController {
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const filter: any = {};
            if (locationId) filter.location = locationId;

            const agreements = await em.find(Agreement, filter, { orderBy: { name: 'ASC' } });
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

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const filter: any = { isActive: true };
            if (locationId) filter.location = locationId;

            const agreements = await em.find(Agreement, filter, { orderBy: { name: 'ASC' } });
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

            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) {
                return res.status(400).json({ message: 'Context required' });
            }

            const { name, type, value, description } = req.body;
            const tenant = await em.getReference('Tenant', tenantId);
            const location = await em.getReference('Location', locationId);

            const agreement = em.create(Agreement, {
                name,
                type,
                value,
                description,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                tenant,
                location
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

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const { id } = req.params;
            const filter: any = { id: Number(id) };
            if (locationId) filter.location = locationId;

            const agreement = await em.findOne(Agreement, filter);

            if (!agreement) {
                return res.status(404).json({ message: 'Agreement not found' });
            }

            agreement.isActive = !agreement.isActive;
            await em.flush();

            res.json(agreement);
        } catch (error) {
            console.error('Error toggling agreement status:', error);
            res.status(500).json({ message: 'Error updating agreement' });
        }
    }
}
