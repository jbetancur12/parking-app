import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { WashEntry } from '../entities/WashEntry';
import { WashServiceType } from '../entities/WashServiceType';
import { Shift } from '../entities/Shift';
import { Transaction, TransactionType } from '../entities/Transaction';
import { ReceiptService } from '../services/ReceiptService';
import { logger } from '../utils/logger';

export class WashController {

    async getServiceTypes(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const types = await em.find(WashServiceType, { isActive: true });
            res.json(types);
        } catch (error) {
            logger.error({ error }, 'Error fetching services');
            res.status(500).json({ message: 'Error fetching services' });
        }
    }

    async createEntry(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { plate, serviceTypeId, operatorName, shiftId, price, paymentMethod } = req.body;

            const shift = await em.findOne(Shift, { id: Number(shiftId) }, { populate: ['tenant', 'location'] });
            if (!shift || !shift.isActive) return res.status(400).json({ message: 'Shift closed or invalid' });

            const serviceType = await em.findOne(WashServiceType, { id: Number(serviceTypeId) });
            if (!serviceType) return res.status(404).json({ message: 'Service type not found' });

            // Use provided price (override) or default to serviceType price
            const finalPrice = price ? Number(price) : serviceType.price;

            // Transactional Wash Entry
            const transactionResult = await em.transactional(async (emTx) => {
                // Generate Receipt Number
                const receiptNumber = await ReceiptService.getNextReceiptNumber(emTx, shift.location.id);

                const washEntry = emTx.create(WashEntry, {
                    plate: plate.toUpperCase(),
                    serviceType,
                    shift,
                    tenant: shift.tenant,
                    location: shift.location,
                    operatorName,
                    cost: finalPrice,
                    status: 'Completed',
                    paymentMethod: paymentMethod || 'CASH',
                    receiptNumber, // Now we save it!
                    createdAt: new Date()
                } as any);

                // Financial Transaction
                const transaction = emTx.create(Transaction, {
                    shift,
                    tenant: shift.tenant,
                    location: shift.location,
                    type: TransactionType.WASH_SERVICE, // Wash service
                    amount: finalPrice,
                    description: `Lavado: ${serviceType.name} (${plate})`,
                    paymentMethod: paymentMethod || 'CASH',
                    timestamp: new Date(),
                    receiptNumber
                } as any);

                emTx.persist([washEntry, transaction]);
                return { receiptNumber, washEntry };
            });

            res.status(201).json({ ...transactionResult.washEntry, receiptNumber: transactionResult.receiptNumber });
        } catch (error) {
            logger.error({ error }, 'Error creating wash entry');
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
            logger.error({ error }, 'Error fetching wash entries');
            res.status(500).json({ message: 'Error fetching wash entries' });
        }
    }

    async seedServices(req: Request, res: Response) {
        const em = RequestContext.getEntityManager();
        if (!em) return res.status(500).json({ message: 'No EM' });

        try {
            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) {
                return res.status(400).json({ message: 'Context required for seeding' });
            }

            const count = await em.count(WashServiceType, {
                tenant: tenantId,
                location: locationId
            });

            if (count === 0) {
                const defaults = [
                    { name: 'Lavado General Moto', price: 15000, vehicleType: 'Moto', isActive: true },
                    { name: 'Lavado General Carro', price: 25000, vehicleType: 'Carro', isActive: true },
                    { name: 'Polichado Moto', price: 25000, vehicleType: 'Moto', isActive: true },
                    { name: 'Polichado Carro', price: 40000, vehicleType: 'Carro', isActive: true },
                ];

                const tenant = await em.getReference('Tenant', tenantId);
                const location = await em.getReference('Location', locationId);

                defaults.forEach(d => {
                    const s = em.create(WashServiceType, {
                        ...d,
                        tenant,
                        location
                    });
                    em.persist(s);
                });
                await em.flush();
            }
            res.json({ message: 'Seeded' });
        } catch (error) {
            logger.error({ error }, 'Seed Wash Error:');
            res.status(500).json({ message: 'Failed to seed wash services' });
        }
    }

    // CRUD for Service Types

    async createType(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { name, price, vehicleType } = req.body;
            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) {
                return res.status(400).json({ message: 'Tenant and Location context required' });
            }

            const tenant = await em.getReference('Tenant', tenantId);
            const location = await em.getReference('Location', locationId);

            const newType = em.create(WashServiceType, {
                name,
                price: Number(price),
                vehicleType,
                isActive: true,
                tenant,
                location
            });

            await em.persistAndFlush(newType);
            res.status(201).json(newType);
        } catch (error) {
            logger.error({ error }, 'Create Wash Type Error:');
            res.status(500).json({ message: 'Error creating wash service type' });
        }
    }

    async updateType(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { id } = req.params;
            const { name, price, vehicleType, isActive } = req.body;

            const serviceType = await em.findOne(WashServiceType, { id: Number(id) });
            if (!serviceType) return res.status(404).json({ message: 'Service type not found' });

            if (name) serviceType.name = name;
            if (price) serviceType.price = Number(price);
            if (vehicleType) serviceType.vehicleType = vehicleType;
            if (typeof isActive === 'boolean') serviceType.isActive = isActive;

            await em.flush();
            res.json(serviceType);
        } catch (error) {
            logger.error({ error }, 'Update Wash Type Error:');
            res.status(500).json({ message: 'Error updating wash service type' });
        }
    }

    async deleteType(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { id } = req.params;
            const serviceType = await em.findOne(WashServiceType, { id: Number(id) });

            if (!serviceType) return res.status(404).json({ message: 'Service type not found' });

            // Hard delete or Soft delete? Soft delete via isActive is safer, but user asked for configuration.
            // Let's go with hard delete but wrap in try-catch in case of FK constraints (which shouldn't happen if we didn't link entries strictly or if we cascade).
            // Actually, WashEntry links to WashServiceType. If we delete, it might fail or nullify.
            // Best practice: Soft delete (isActive = false).
            serviceType.isActive = false;
            await em.flush();

            res.json({ message: 'Service type deactivated' });
        } catch (error) {
            logger.error({ error }, 'Delete Wash Type Error:');
            res.status(500).json({ message: 'Error deleting wash service type' });
        }
    }
}
