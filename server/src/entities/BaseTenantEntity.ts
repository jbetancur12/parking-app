import { Entity, ManyToOne, Filter, Property } from '@mikro-orm/core';
import { Tenant } from './Tenant';
import { Location } from './Location';

@Filter({
    name: 'tenant',
    cond: (args) => ({ tenant: args.tenantId }),
    default: true // Enabled by default for security
})
@Entity({ abstract: true })
export abstract class BaseTenantEntity {

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @ManyToOne(() => Location)
    location!: Location;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
