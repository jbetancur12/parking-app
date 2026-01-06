import { Entity, PrimaryKey, Property, Enum, OneToMany, ManyToMany, Collection, Cascade, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Location } from './Location';
import { User } from './User';
import { PricingPlan } from './PricingPlan';

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

    @Property()
    plan: string = TenantPlan.BASIC;

    @ManyToOne(() => PricingPlan, { nullable: true })
    pricingPlan?: PricingPlan;

    @Property()
    maxLocations: number = 1;

    @Property()
    maxUsers: number = 2; // Default limit for BASIC

    @Property({ nullable: true })
    trialEndsAt?: Date;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    // Relationships
    @OneToMany(() => Location, location => location.tenant, { cascade: [Cascade.ALL] })
    locations = new Collection<Location>(this);

    @ManyToMany(() => User, user => user.tenants)
    users = new Collection<User>(this);

    @OneToMany('Subscription', 'tenant')
    subscriptions = new Collection<any>(this);

    get isActive(): boolean {
        return this.status === TenantStatus.ACTIVE;
    }
}

export enum TenantStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived'
}

export enum TenantPlan {
    BASIC = 'basic',
    TRIAL = 'trial',
    PRO = 'pro',
    ENTERPRISE = 'enterprise'
}
