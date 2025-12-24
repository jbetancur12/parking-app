import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { MonthlyClient } from '../entities/MonthlyClient';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { Shift } from '../entities/Shift';
import { MonthlyPayment } from '../entities/MonthlyPayment';

export class MonthlyClientController {

    // Get all clients
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            // Support basic simple search by name or plate
            const { search } = req.query;
            const where: any = {};

            if (locationId) where.location = locationId;

            if (search) {
                where.$or = [
                    { name: { $ilike: `%${search}%` } },
                    { plate: { $ilike: `%${search}%` } }
                ];
            }

            const clients = await em.find(MonthlyClient, where, { orderBy: { name: 'ASC' } });
            res.json(clients);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching clients' });
        }
    }

    // Create new client
    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) {
                return res.status(400).json({ message: 'Context required' });
            }

            const user = (req as any).user;
            const { plate, name, phone, vehicleType, monthlyRate } = req.body;

            // 1. Check if ANY client exists with this plate (active or inactive) in this location
            const existingClient = await em.findOne(MonthlyClient, { plate, location: locationId });

            const tenant = await em.getReference('Tenant', tenantId); // UUID string
            const location = await em.getReference('Location', locationId); // UUID string

            if (existingClient) {
                if (existingClient.isActive) {
                    return res.status(400).json({ message: 'Ya existe un cliente activo con esta placa en esta sede' });
                }

                // REACTIVATE LOGIC for inactive client
                existingClient.name = name;
                existingClient.phone = phone;
                existingClient.vehicleType = vehicleType;
                existingClient.monthlyRate = monthlyRate || 0;

                // Set new period starting today
                const startDate = new Date();
                const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

                existingClient.startDate = startDate;
                existingClient.endDate = endDate;
                existingClient.isActive = true;
                existingClient.updatedAt = new Date();

                // Create payment record for reactivation
                const payment = em.create(MonthlyPayment, {
                    client: existingClient,
                    periodStart: startDate,
                    periodEnd: endDate,
                    amount: monthlyRate || 0,
                    paymentDate: new Date()
                });

                // Transaction Logic
                const activeShift = await em.findOne(Shift, {
                    user: user.id,
                    isActive: true,
                    location: locationId
                }, { populate: ['tenant', 'location'] });

                if (activeShift) {
                    const transaction = em.create(Transaction, {
                        shift: activeShift,
                        tenant: activeShift.tenant,
                        location: activeShift.location,
                        type: TransactionType.MONTHLY_PAYMENT,
                        description: `Reactivación Mensualidad: ${name} (${plate})`,
                        amount: monthlyRate || 0,
                        paymentMethod: PaymentMethod.CASH,
                        timestamp: new Date()
                    });
                    em.persist(transaction);
                }

                em.persist(payment);
                await em.flush();

                return res.status(200).json({ client: existingClient, payment, message: 'Cliente reactivado exitosamente' });
            }

            // 2. New Client Creation
            const startDate = new Date();
            const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

            const client = em.create(MonthlyClient, {
                plate,
                name,
                phone,
                vehicleType,
                monthlyRate: monthlyRate || 0,
                startDate,
                endDate,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                tenant,
                location
            });

            // Create initial payment record
            const payment = em.create(MonthlyPayment, {
                client,
                periodStart: startDate,
                periodEnd: endDate,
                amount: monthlyRate || 0,
                paymentDate: new Date()
            });

            // Need to create a Transaction for the initial payment as well if there's an active shift
            const activeShift = await em.findOne(Shift, {
                user: user.id,
                isActive: true,
                location: locationId
            }, { populate: ['tenant', 'location'] });

            if (activeShift) {
                const transaction = em.create(Transaction, {
                    shift: activeShift,
                    tenant: activeShift.tenant,
                    location: activeShift.location,
                    type: TransactionType.MONTHLY_PAYMENT,
                    description: `Nueva Mensualidad: ${name} (${plate})`,
                    amount: monthlyRate || 0,
                    paymentMethod: PaymentMethod.CASH,
                    timestamp: new Date()
                });
                em.persist(transaction);
            }

            em.persist([client, payment]);
            await em.flush();

            // Return both client and payment for receipt
            res.status(201).json({ client, payment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating client' });
        }
    }

    // Renew subscription
    async renew(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const { id } = req.params;
            const { amount, paymentMethod } = req.body;

            // Find client strictly within location
            const client = await em.findOne(MonthlyClient, { id: Number(id), location: locationId });

            if (!client) {
                return res.status(404).json({ message: 'Client not found or not in this location' });
            }

            // Logic: Add 1 month to the current end date (or today if expired)
            const now = new Date();
            const baseDate = client.endDate > now ? client.endDate : now;

            const newEndDate = new Date(baseDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);

            client.endDate = newEndDate;
            client.isActive = true;

            // Create payment record
            const payment = em.create(MonthlyPayment, {
                client,
                periodStart: baseDate,
                periodEnd: newEndDate,
                amount: amount || client.monthlyRate,
                paymentDate: new Date()
            });
            em.persist(payment);

            // Create Transaction
            const activeShift = await em.findOne(Shift, {
                user: (req as any).user.id,
                isActive: true,
                location: locationId
            }, { populate: ['tenant', 'location'] });

            // Create transaction
            if (activeShift) {
                const transaction = em.create(Transaction, {
                    shift: activeShift,
                    tenant: activeShift.tenant,
                    location: activeShift.location,
                    type: TransactionType.MONTHLY_PAYMENT,
                    description: `Renovación: ${client.name} (${client.plate})`,
                    amount: amount || client.monthlyRate,
                    paymentMethod: paymentMethod || PaymentMethod.CASH,
                    timestamp: new Date()
                });
                em.persist(transaction);
            } else {
                console.warn('Renewing monthly without active shift');
                return res.status(400).json({ message: 'No active shift found. Please start a shift to renew.' });
            }

            await em.flush();
            res.json({ client, payment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error renewing subscription' });
        }
    }

    // Get client history
    async getHistory(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const { id } = req.params;
            const client = await em.findOne(MonthlyClient, { id: Number(id), location: locationId });

            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            const payments = await em.find(MonthlyPayment, {
                client: client.id
            }, { orderBy: { paymentDate: 'DESC' } });

            res.json(payments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching history' });
        }
    }


    // Toggle active status
    async toggleStatus(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EntityManager found' });

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            const { id } = req.params;
            const client = await em.findOne(MonthlyClient, { id: Number(id), location: locationId });

            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            client.isActive = !client.isActive;
            await em.flush();

            res.json({ message: 'Status updated', isActive: client.isActive });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating status' });
        }
    }

}
