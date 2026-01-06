import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { BaseTenantEntity } from './BaseTenantEntity';

export enum BillingPeriod {
    MONTH = 'MONTH',
    TWO_WEEKS = 'TWO_WEEKS',
    WEEK = 'WEEK'
}

@Entity()
export class MonthlyClient extends BaseTenantEntity {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    plate!: string;

    @Property()
    name!: string;

    @Property({ nullable: true })
    phone?: string;

    @Property({ nullable: true })
    vehicleType?: string;

    @Property()
    startDate!: Date;

    @Property()
    endDate!: Date;

    @Enum(() => BillingPeriod)
    billingPeriod: BillingPeriod = BillingPeriod.MONTH;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    monthlyRate!: number;

    @Property()
    isActive: boolean = true;

    @Property()
    termsAccepted: boolean = true; // Implied consent by payment

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();


}
