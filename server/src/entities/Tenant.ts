import { Entity, PrimaryKey, Property, Enum, OneToMany, ManyToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Location } from './Location';
import { User } from './User';

@Entity()
export class Tenant {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @Property()
    name!: string;

    @Property({ unique: true })
    slug!: string; // For subdomains or identification (e.g., "donpepe")

    @Property({ nullable: true })
    contactEmail?: string;

    @Enum(() => TenantStatus)
    status = TenantStatus.ACTIVE;

    @Enum(() => TenantPlan)
    plan = TenantPlan.FREE;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    // Relationships
    @OneToMany(() => Location, location => location.tenant, { cascade: [Cascade.ALL] })
    locations = new Collection<Location>(this);

    @ManyToMany(() => User, user => user.tenants)
    users = new Collection<User>(this);
}

export enum TenantStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived'
}

export enum TenantPlan {
    FREE = 'free',
    PRO = 'pro',
    ENTERPRISE = 'enterprise'
}
