import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Tenant } from './Tenant';
import { Location } from './Location';
import { BaseTenantEntity } from './BaseTenantEntity';

@Entity()
export class Product extends BaseTenantEntity {
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


}
