import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class PricingPlan {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @Property({ unique: true })
    code!: string; // 'trial', 'basic', 'pro', 'enterprise'

    @Property()
    name!: string; // 'Trial', 'Basic', 'Pro', 'Enterprise'

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Property({ default: 'monthly' })
    billingPeriod = 'monthly'; // 'monthly', 'annual'

    @Property()
    maxLocations!: number; // -1 for unlimited

    @Property()
    maxUsers!: number; // -1 for unlimited

    @Property()
    maxSessions!: number; // -1 for unlimited

    @Property({ type: 'json' })
    features!: string[]; // Array of feature descriptions

    @Property()
    support!: string; // 'Email', 'Priority', '24/7'

    @Property({ default: true })
    isActive = true;

    @Property({ default: 0 })
    displayOrder = 0; // For sorting in UI

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();
}
