import { Entity, PrimaryKey, Property, Enum, ManyToOne, Index } from '@mikro-orm/core';
import { Shift } from './Shift';
import { BaseTenantEntity } from './BaseTenantEntity';

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
export class Transaction extends BaseTenantEntity {
    @PrimaryKey()
    id!: number;

    @Index()
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

    @Property()
    timestamp: Date = new Date();

    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discount?: number;

    @Property({ nullable: true })
    discountReason?: string;

    @ManyToOne(() => 'Agreement', { nullable: true })
    agreement?: any;


}
