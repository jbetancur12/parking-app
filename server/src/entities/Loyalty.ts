import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';

@Entity()
export class Loyalty {
    @PrimaryKey()
    id!: number;

    @Property()
    plate!: string;

    @Property()
    points: number = 0;

    @Property()
    totalVisits: number = 0;

    @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
    lastVisit: Date = new Date();

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location', { nullable: true })
    location?: any; // Optional: Points specific to a location
}
