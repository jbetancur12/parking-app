import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { Product } from '../entities/Product';
import { Location } from '../entities/Location';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuditService } from '../services/AuditService';
import { logger } from '../utils/logger';

export class ProductController {

    async create(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em || !req.user || !req.tenant) return res.status(500).json({ message: 'Internal Server Error' });

            // Only ADMIN or SUPER_ADMIN can create products
            // Only ADMIN or SUPER_ADMIN or LOCATION_MANAGER can create products
            if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'LOCATION_MANAGER') {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            const { name, price, stock, minStock } = req.body;
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!locationId) {
                return res.status(400).json({ message: 'Location context required' });
            }

            if (!name || !price) {
                return res.status(400).json({ message: 'Name and Price are required' });
            }

            const location = await em.getReference(Location, locationId);

            const product = em.create(Product, {
                name: String(name),
                price: Number(price),
                stock: stock ? Number(stock) : 0,
                minStock: minStock ? Number(minStock) : 5,
                isActive: true,
                tenant: req.tenant,
                location
            } as any);

            await em.persistAndFlush(product);

            await AuditService.log(
                em,
                'CREATE_PRODUCT',
                'Product',
                String(product.id),
                (req as any).user,
                { name, price, stock },
                req
            );

            res.status(201).json(product);
        } catch (error) {
            logger.error({ error }, 'Error creating product');
            res.status(500).json({ message: 'Error creating product' });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!locationId) {
                return res.status(400).json({ message: 'Location context required' });
            }

            const products = await em.find(Product, {
                location: locationId,
                isActive: true
            }, {
                orderBy: { name: 'ASC' }
            });

            res.json(products);
        } catch (error) {
            logger.error({ error }, 'Error fetching products');
            res.status(500).json({ message: 'Error fetching products' });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em || !req.user) return res.status(500).json({ message: 'No EM' });

            if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'LOCATION_MANAGER') {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            const { id } = req.params;
            const { name, price, stock, minStock } = req.body;

            const product = await em.findOne(Product, { id: Number(id) });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            if (name) product.name = name;
            if (price) product.price = Number(price);
            if (stock !== undefined) product.stock = Number(stock);
            if (minStock !== undefined) product.minStock = Number(minStock);

            await em.flush();

            await AuditService.log(
                em,
                'UPDATE_PRODUCT',
                'Product',
                String(id),
                (req as any).user,
                { id, name, price, stock, minStock },
                req
            );

            res.json(product);
        } catch (error) {
            logger.error({ error }, 'Error updating product');
            res.status(500).json({ message: 'Error updating product' });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em || !req.user) return res.status(500).json({ message: 'No EM' });

            if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'LOCATION_MANAGER') {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            const { id } = req.params;
            const product = await em.findOne(Product, { id: Number(id) });
            if (!product) return res.status(404).json({ message: 'Product not found' });

            product.isActive = false;
            await em.flush();

            await AuditService.log(
                em,
                'DELETE_PRODUCT',
                'Product',
                String(product.id),
                (req as any).user,
                { id, name: product.name },
                req
            );

            res.json({ message: 'Product deleted' });
        } catch (error) {
            logger.error({ error }, 'Error deleting product');
            res.status(500).json({ message: 'Error deleting product' });
        }
    }
}
