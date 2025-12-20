import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { MonthlyClient } from './MonthlyClient';

@Entity()
export class MonthlyPayment {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => MonthlyClient)
    client!: MonthlyClient;

    @Property()
    periodStart!: Date;

    @Property()
    periodEnd!: Date;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Property({ onCreate: () => new Date() })
    paymentDate: Date = new Date();
}
