"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TariffController = void 0;
const core_1 = require("@mikro-orm/core");
const Tariff_1 = require("../entities/Tariff");
class TariffController {
    // Get all tariffs
    async getAll(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const tariffs = await em.find(Tariff_1.Tariff, {}, { orderBy: { vehicleType: 'ASC', tariffType: 'ASC' } });
            res.json(tariffs);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching tariffs' });
        }
    }
    // Update or Create Tariff
    async update(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            // Expecting an array of tariffs or single update
            // Let's support bulk update/upsert for simplicity in settings page
            const items = Array.isArray(req.body) ? req.body : [req.body];
            for (const item of items) {
                if (item.id) {
                    const tariff = await em.findOne(Tariff_1.Tariff, { id: item.id });
                    if (tariff) {
                        tariff.cost = item.cost;
                    }
                }
                else {
                    // Create if not exists (seed logic mostly)
                    const tariff = em.create(Tariff_1.Tariff, {
                        vehicleType: item.vehicleType,
                        tariffType: item.tariffType,
                        cost: item.cost
                    });
                    em.persist(tariff);
                }
            }
            await em.flush();
            res.json({ message: 'Tariffs updated' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating tariffs' });
        }
    }
    // Initialize default tariffs (Helper for seed)
    async seedDefaults(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const defaults = [
                { vehicleType: Tariff_1.VehicleType.CAR, tariffType: Tariff_1.TariffType.MINUTE, cost: 100 },
                { vehicleType: Tariff_1.VehicleType.CAR, tariffType: Tariff_1.TariffType.HOUR, cost: 3000 },
                { vehicleType: Tariff_1.VehicleType.CAR, tariffType: Tariff_1.TariffType.DAY, cost: 15000 },
                { vehicleType: Tariff_1.VehicleType.CAR, tariffType: Tariff_1.TariffType.MONTH, cost: 150000 },
                { vehicleType: Tariff_1.VehicleType.MOTORCYCLE, tariffType: Tariff_1.TariffType.MINUTE, cost: 50 },
                { vehicleType: Tariff_1.VehicleType.MOTORCYCLE, tariffType: Tariff_1.TariffType.HOUR, cost: 2000 },
                { vehicleType: Tariff_1.VehicleType.MOTORCYCLE, tariffType: Tariff_1.TariffType.DAY, cost: 8000 },
                { vehicleType: Tariff_1.VehicleType.MOTORCYCLE, tariffType: Tariff_1.TariffType.MONTH, cost: 50000 },
            ];
            for (const d of defaults) {
                const exists = await em.findOne(Tariff_1.Tariff, { vehicleType: d.vehicleType, tariffType: d.tariffType });
                if (!exists) {
                    em.persist(em.create(Tariff_1.Tariff, d));
                }
            }
            await em.flush();
            res.json({ message: 'Seeded' });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Error seeding' });
        }
    }
}
exports.TariffController = TariffController;
