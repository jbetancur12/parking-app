import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Shift } from './Shift';
import { WashServiceType } from './WashServiceType';

@Entity()
export class WashEntry {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Shift)
    shift!: Shift;

    @ManyToOne(() => WashServiceType)
    serviceType!: WashServiceType;

    @Property()
    plate!: string;

    @Property({ nullable: true })
    operatorName?: string; // Legacy 'lavador'

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    cost!: number; // Captured at time of service in case prices change

    @Property()
    status: string = 'Completed'; // Pending, Completed

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location')
    location!: any;
}
