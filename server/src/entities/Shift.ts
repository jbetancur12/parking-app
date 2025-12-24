import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';

@Entity()
export class Shift {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @Property()
    startTime: Date = new Date();

    @Property({ nullable: true })
    endTime?: Date;

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    baseAmount: number = 0; // Base/Starting cash

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalIncome: number = 0; // Calculated at close

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalExpenses: number = 0; // Calculated at close

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    cashIncome: number = 0;

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    transferIncome: number = 0;

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    declaredAmount: number = 0; // Cash physically counted

    @Property({ nullable: true })
    notes?: string;

    // Status linked to whether endTime is set, but explicit status helps
    @Property()
    isActive: boolean = true;

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location')
    location!: any;
}
