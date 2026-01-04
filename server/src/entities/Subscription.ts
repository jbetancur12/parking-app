import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Tenant } from './Tenant';
import { Invoice } from './Invoice';

export enum SubscriptionStatus {
    TRIALING = 'trialing',
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELLED = 'cancelled',
    UNPAID = 'unpaid'
}

@Entity()
export class Subscription {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @Property()
    plan!: string; // 'basic', 'pro', 'enterprise'

    @Enum(() => SubscriptionStatus)
    status = SubscriptionStatus.TRIALING;

    @Property()
    currentPeriodStart!: Date;

    @Property()
    currentPeriodEnd!: Date;

    @Property({ default: false })
    cancelAtPeriodEnd = false;

    @Property({ nullable: true })
    cancelledAt?: Date;

    @Property({ nullable: true })
    trialStart?: Date;

    @Property({ nullable: true })
    trialEnd?: Date;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number; // Monthly amount in USD

    @Property({ default: 'USD' })
    currency = 'USD';

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    // Relationships
    @OneToMany(() => Invoice, invoice => invoice.subscription, { cascade: [Cascade.ALL] })
    invoices = new Collection<Invoice>(this);
}
