import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Tenant } from './Tenant';

@Entity()
export class UsageRecord {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @Property()
    month!: string; // Format: YYYY-MM

    @Property({ default: 0 })
    sessionsCount = 0;

    @Property({ default: 0 })
    usersCount = 0;

    @Property({ default: 0 })
    locationsCount = 0;

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();
}
