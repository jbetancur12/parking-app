import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Tariff, VehicleType, TariffType } from '../entities/Tariff';
import { AuditService } from '../services/AuditService';

export class TariffController {

    // Get all tariffs
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const filter: any = {};
            if (locationId) {
                filter.location = locationId;
            }

            const tariffs = await em.find(Tariff, filter, { orderBy: { vehicleType: 'ASC', tariffType: 'ASC' } });
            res.json(tariffs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching tariffs' });
        }
    }

    // Update or Create Tariff
    async update(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) {
                return res.status(400).json({ message: 'Context required' });
            }

            const items = Array.isArray(req.body) ? req.body : [req.body];

            const tenant = await em.getReference('Tenant', tenantId);
            const location = await em.getReference('Location', locationId);

            for (const item of items) {
                if (item.id) {
                    const tariff = await em.findOne(Tariff, { id: item.id, location: locationId });
                    if (tariff) {
                        tariff.cost = item.cost;
                    }
                } else {
                    const tariff = em.create(Tariff, {
                        vehicleType: item.vehicleType,
                        tariffType: item.tariffType,
                        cost: item.cost,
                        tenant,
                        location
                    });
                    em.persist(tariff);
                }
            }

            await em.flush();

            await AuditService.logAction(
                em,
                (req as any).user,
                'UPDATE_TARIFFS',
                'Tariff',
                undefined,
                items
            );

            res.json({ message: 'Tariffs updated' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating tariffs' });
        }
    }

    // Initialize default tariffs (Helper for seed)
    async seedDefaults(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) return res.status(400).json({ message: 'Context required' });

            const defaults = [
                { vehicleType: VehicleType.CAR, tariffType: TariffType.MINUTE, cost: 100 },
                { vehicleType: VehicleType.CAR, tariffType: TariffType.HOUR, cost: 3000 },
                { vehicleType: VehicleType.CAR, tariffType: TariffType.DAY, cost: 15000 },
                { vehicleType: VehicleType.CAR, tariffType: TariffType.MONTH, cost: 150000 },
                { vehicleType: VehicleType.MOTORCYCLE, tariffType: TariffType.MINUTE, cost: 50 },
                { vehicleType: VehicleType.MOTORCYCLE, tariffType: TariffType.HOUR, cost: 2000 },
                { vehicleType: VehicleType.MOTORCYCLE, tariffType: TariffType.DAY, cost: 8000 },
                { vehicleType: VehicleType.MOTORCYCLE, tariffType: TariffType.MONTH, cost: 50000 },
            ];

            const tenant = await em.getReference('Tenant', tenantId);
            const location = await em.getReference('Location', locationId);

            for (const d of defaults) {
                const exists = await em.findOne(Tariff, {
                    vehicleType: d.vehicleType,
                    tariffType: d.tariffType,
                    location: locationId
                });
                if (!exists) {
                    em.persist(em.create(Tariff, { ...d, tenant, location }));
                }
            }
            await em.flush();
            res.json({ message: 'Seeded' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error seeding' });
        }
    }
}
