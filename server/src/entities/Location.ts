import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection, Cascade, Filter } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Tenant } from './Tenant';
import { User } from './User';

@Filter({
    name: 'tenant',
    cond: (args) => ({ tenant: args.tenantId }),
    default: true
})
@Entity()
export class Location {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @Property()
    name!: string; // e.g., "Sede Centro"

    @Property({ nullable: true })
    address?: string;

    @Property({ nullable: true })
    phone?: string;

    // Settings specific to this location (JSON)
    @Property({ type: 'json', nullable: true })
    settings?: {
        ticketHeader?: string;
        ticketFooter?: string;
        printerName?: string;
        taxRate?: number;
        currency?: string;
    };

    @Property()
    isActive = true;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    @ManyToMany(() => User, user => user.locations)
    users = new Collection<User>(this);
}
