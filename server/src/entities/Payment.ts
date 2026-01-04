import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Tenant } from './Tenant';
import { Invoice } from './Invoice';

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum PaymentMethod {
    CARD = 'card',
    TRANSFER = 'transfer',
    CASH = 'cash',
    OTHER = 'other'
}

@Entity()
export class Payment {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @ManyToOne(() => Invoice)
    invoice!: Invoice;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Property({ default: 'USD' })
    currency = 'USD';

    @Enum(() => PaymentStatus)
    status = PaymentStatus.PENDING;

    @Enum(() => PaymentMethod)
    paymentMethod!: PaymentMethod;

    @Property({ nullable: true })
    transactionId?: string; // External payment gateway transaction ID

    @Property({ type: 'json', nullable: true })
    metadata?: any; // Additional payment data

    @Property({ type: 'text', nullable: true })
    notes?: string;

    @Property({ nullable: true })
    processedAt?: Date;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();
}
