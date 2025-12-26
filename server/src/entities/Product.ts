import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Tenant } from './Tenant';
import { Location } from './Location';

@Entity()
export class Product {
    @PrimaryKey()
    id!: number;

    @Property()
    name!: string;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Property()
    stock: number = 0;

    @Property()
    minStock: number = 5;

    @Property()
    isActive: boolean = true;

    // SaaS Relationships
    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @ManyToOne(() => Location)
    location!: Location;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
