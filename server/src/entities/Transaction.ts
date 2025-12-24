import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { Shift } from './Shift';

export enum TransactionType {
    INCOME = 'INCOME', // General income (not parking)
    EXPENSE = 'EXPENSE', // Gastos
    PARKING_REVENUE = 'PARKING_REVENUE', // Automatically generated from parking close
    MONTHLY_PAYMENT = 'MONTHLY_PAYMENT', // Monthly subscription payment
    WASH_SERVICE = 'WASH_SERVICE', // Car wash service
}

export enum PaymentMethod {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER'
}

@Entity()
export class Transaction {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Shift)
    shift!: Shift;

    @Enum(() => TransactionType)
    type!: TransactionType;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Property()
    description!: string;

    @Enum(() => PaymentMethod)
    paymentMethod?: PaymentMethod; // Optional: only for income transactions

    @Property({ onCreate: () => new Date() })
    timestamp: Date = new Date();

    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discount?: number;

    @Property({ nullable: true })
    discountReason?: string;

    @ManyToOne(() => 'Agreement', { nullable: true })
    agreement?: any;

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location')
    location!: any;
}
