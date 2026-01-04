import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Tenant } from './Tenant';
import { Subscription } from './Subscription';
import { InvoiceItem } from './InvoiceItem';
import { Payment } from './Payment';

export enum InvoiceStatus {
    DRAFT = 'draft',
    OPEN = 'open',
    PAID = 'paid',
    VOID = 'void',
    UNCOLLECTIBLE = 'uncollectible'
}

@Entity()
export class Invoice {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @ManyToOne(() => Subscription, { nullable: true })
    subscription?: Subscription;

    @Property({ unique: true })
    invoiceNumber!: string; // e.g., "INV-2024-001"

    @Enum(() => InvoiceStatus)
    status = InvoiceStatus.DRAFT;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    subtotal!: number;

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    tax = 0;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    total!: number;

    @Property({ default: 'USD' })
    currency = 'USD';

    @Property()
    dueDate!: Date;

    @Property({ nullable: true })
    paidAt?: Date;

    @Property({ nullable: true })
    voidedAt?: Date;

    @Property({ type: 'text', nullable: true })
    notes?: string;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    // Relationships
    @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: [Cascade.ALL] })
    items = new Collection<InvoiceItem>(this);

    @OneToMany(() => Payment, payment => payment.invoice)
    payments = new Collection<Payment>(this);
}
