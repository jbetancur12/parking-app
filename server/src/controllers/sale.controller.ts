import { Request, Response } from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Transaction, TransactionType, PaymentMethod } from '../entities/Transaction';
import { Shift } from '../entities/Shift';
import { Product } from '../entities/Product';

export class SaleController {

    async create(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { description, amount, paymentMethod, items } = req.body;
            const user = (req as any).user;
            let finalAmount = Number(amount);
            let finalDescription = description;

            // Optional: Recalculate or Validate if items present
            if (items && Array.isArray(items) && items.length > 0) {
                // We are in POS mode
                const Product = (await import('../entities/Product')).Product; // Dynamic import to avoid cycles or just import at top?
                // Better to import at top but let's assume imports are safe.

                let explicitTotal = 0;
                const productSummary: string[] = [];

                for (const item of items) {
                    const product = await em.findOne(Product, { id: item.productId });
                    if (!product) {
                        return res.status(404).json({ message: `Product ${item.productId} not found` });
                    }

                    if (product.stock < item.quantity) {
                        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                    }

                    // Deduct stock
                    product.stock -= item.quantity;
                    explicitTotal += (Number(product.price) * item.quantity);
                    productSummary.push(`${item.quantity}x ${product.name}`);
                }

                // If items provided, override or valid amount?
                // Let's rely on frontend sending correct amount for now, OR enforce it.
                // Enforcing is safer.
                if (Math.abs(finalAmount - explicitTotal) > 0.01) {
                    // If they differ significantly, prefer the calculated one? 
                    // Or just validate. Let's keep the user provided amount but valid if it matches approx.
                    // Actually, let's just use the calculated one for safety.
                    finalAmount = explicitTotal;
                }

                finalDescription = `Venta: ${productSummary.join(', ')}`;
            }

            if (!finalDescription || !finalAmount || finalAmount <= 0) {
                return res.status(400).json({ message: 'Invalid description or amount' });
            }

            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            // Find active shift for user in this location (if possible)
            // Or just active shift for user. 
            // Better to include location for safety.
            const filter: any = {
                user: user.id,
                isActive: true // active shift
            };
            if (locationId) {
                filter.location = locationId;
            }

            const activeShift = await em.findOne(Shift, filter, { populate: ['tenant', 'location'] });

            if (!activeShift) {
                return res.status(400).json({ message: 'No active shift found. Please start a shift first.' });
            }

            const transaction = em.create(Transaction, {
                shift: activeShift,
                tenant: activeShift.tenant,
                location: activeShift.location,
                type: TransactionType.INCOME,
                paymentMethod: paymentMethod || PaymentMethod.CASH,
                description: finalDescription,
                amount: finalAmount,
                timestamp: new Date()
            });

            await em.persistAndFlush(transaction);
            res.status(201).json(transaction);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error registering sale' });
        }
    }

    async getAllByShift(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const { shiftId } = req.params;
            const transactions = await em.find(Transaction, {
                shift: Number(shiftId),
                type: TransactionType.INCOME
            }, { orderBy: { timestamp: 'DESC' } });

            res.json(transactions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching sales' });
        }
    }
}
