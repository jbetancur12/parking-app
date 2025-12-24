import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';

@Entity()
export class WashServiceType {
    @PrimaryKey()
    id!: number;

    @Property()
    name!: string;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Property()
    vehicleType!: string; // Moto, Carro, etc.

    @Property()
    isActive: boolean = true;

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location')
    location!: any;
}
