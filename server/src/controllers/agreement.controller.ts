import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Agreement } from '../entities/Agreement';
import { Transaction } from '../entities/Transaction';

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

    async getStats(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!locationId) return res.status(400).json({ message: 'Location required' });

            // Date filtering
            const { startDate, endDate } = req.query;
            const params: any[] = [locationId];
            let dateFilter = '';

            if (startDate && endDate) {
                // Parse dates
                const start = new Date(startDate as string);
                const end = new Date(endDate as string);

                console.log('Agreement Stats Filter:', { start: start.toISOString(), end: end.toISOString(), locationId });

                dateFilter = 'AND t.timestamp >= ? AND t.timestamp <= ?';
                params.push(start.toISOString(), end.toISOString());
            }

            // 1. Get all agreements for this location
            const agreements = await em.find(Agreement, { location: locationId });

            // 2. Get usage stats from Transactions
            // Using raw SQL to avoid QB quoting issues with aggregate functions
            const connection = em.getConnection();
            const sql = `
                SELECT 
                    t.agreement_id as agreement, 
                    COUNT(t.id) as count, 
                    SUM(COALESCE(t.discount, 0)) as total_discount
                FROM transaction t
                WHERE t.location_id = ? AND t.agreement_id IS NOT NULL ${dateFilter}
                GROUP BY t.agreement_id
            `;

            const stats: any[] = await connection.execute(sql, params);

            // 3. Merge stats
            const result = agreements.map(a => {
                // MikroORM raw result might return string keys or snake_case depending on driver
                // psql usually returns lowercase columns
                const stat = stats.find((s: any) => Number(s.agreement) === a.id);
                return {
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    value: a.value,
                    usageCount: stat ? Number(stat.count) : 0,
                    totalDiscount: stat ? Number(stat.total_discount) : 0
                };
            });
            // Sort by usage count desc
            result.sort((a, b) => b.usageCount - a.usageCount);

            res.json(result);
        } catch (error) {
            console.error('Error fetching agreement stats:', error);
            res.status(500).json({ message: 'Error fetching stats' });
        }
    }
}
