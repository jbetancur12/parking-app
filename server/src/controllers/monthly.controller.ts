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

            // Support basic simple search by name or plate
            const { search } = req.query;
            const where: any = {};

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

            const { plate, name, phone, vehicleType, monthlyRate } = req.body;

            // Check if there's already an active client with this plate
            const existingActive = await em.findOne(MonthlyClient, {
                plate,
                isActive: true
            });
            if (existingActive) {
                return res.status(400).json({ message: 'Ya existe un cliente activo con esta placa' });
            }

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
                updatedAt: new Date()
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
            // This fixes the issue where new clients didn't register income
            const activeShift = await em.findOne(Shift, { endTime: null });
            if (activeShift) {
                const transaction = em.create(Transaction, {
                    shift: activeShift,
                    type: TransactionType.MONTHLY_PAYMENT,
                    description: `Nueva Mensualidad: ${name} (${plate})`,
                    amount: monthlyRate || 0,
                    paymentMethod: PaymentMethod.CASH, // Default to CASH for now
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

            const { id } = req.params;
            const { amount, paymentMethod } = req.body; // Allow overriding amount and payment method

            const client = await em.findOne(MonthlyClient, { id: Number(id) });

            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }

            // Logic: Add 1 month to the current end date (or today if expired)
            // If expired, start from today. If active, extend from current end date.
            const now = new Date();
            const baseDate = client.endDate > now ? client.endDate : now;

            // Calculate new end date properly
            const newEndDate = new Date(baseDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);

            const oldEndDate = client.endDate;
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
            // Need active shift to link transaction
            const activeShift = await em.findOne(Shift, { endTime: null });

            // Create transaction
            if (activeShift) {
                const transaction = em.create(Transaction, {
                    shift: activeShift,
                    type: TransactionType.MONTHLY_PAYMENT,
                    description: `Renovación: ${client.name} (${client.plate})`,
                    amount: amount || client.monthlyRate,
                    paymentMethod: paymentMethod || PaymentMethod.CASH, // Default to CASH
                    timestamp: new Date()
                });
                em.persist(transaction);
            } else {
                console.warn('Renewing monthly without active shift');
                // We allow it but warn, or block? 
                // Better to block to ensure money is tracked, unless explictly allowed.
                // For now, allow it but money won't be in a shift box strictly.
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

            const { id } = req.params;
            const client = await em.findOne(MonthlyClient, { id: Number(id) });

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


}
