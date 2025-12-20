"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandController = void 0;
const core_1 = require("@mikro-orm/core");
const Brand_1 = require("../entities/Brand");
class BrandController {
    async getAll(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const brands = await em.find(Brand_1.Brand, {}, { orderBy: { name: 'ASC' } });
            res.json(brands);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching brands' });
        }
    }
    async create(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ message: 'Name required' });
            const exists = await em.findOne(Brand_1.Brand, { name });
            if (exists)
                return res.status(400).json({ message: 'Brand already exists' });
            const brand = em.create(Brand_1.Brand, {
                name,
                isActive: true,
                createdAt: new Date()
            });
            await em.persistAndFlush(brand);
            res.status(201).json(brand);
        }
        catch (error) {
            res.status(500).json({ message: 'Error creating brand' });
        }
    }
    async delete(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const { id } = req.params;
            const brand = await em.findOne(Brand_1.Brand, { id: Number(id) });
            if (!brand)
                return res.status(404).json({ message: 'Brand not found' });
            await em.removeAndFlush(brand);
            res.status(200).json({ message: 'Brand deleted' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error deleting brand' });
        }
    }
}
exports.BrandController = BrandController;
