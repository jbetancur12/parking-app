import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Tariff, VehicleType, TariffType } from '../entities/Tariff';

export class TariffController {

    // Get all tariffs
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const tariffs = await em.find(Tariff, {}, { orderBy: { vehicleType: 'ASC', tariffType: 'ASC' } });
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

            // Expecting an array of tariffs or single update
            // Let's support bulk update/upsert for simplicity in settings page
            const items = Array.isArray(req.body) ? req.body : [req.body];

            for (const item of items) {
                if (item.id) {
                    const tariff = await em.findOne(Tariff, { id: item.id });
                    if (tariff) {
                        tariff.cost = item.cost;
                    }
                } else {
                    // Create if not exists (seed logic mostly)
                    const tariff = em.create(Tariff, {
                        vehicleType: item.vehicleType,
                        tariffType: item.tariffType,
                        cost: item.cost
                    });
                    em.persist(tariff);
                }
            }

            await em.flush();
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

            for (const d of defaults) {
                const exists = await em.findOne(Tariff, { vehicleType: d.vehicleType, tariffType: d.tariffType });
                if (!exists) {
                    em.persist(em.create(Tariff, d));
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
