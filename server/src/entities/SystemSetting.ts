import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';

@Entity()
export class SystemSetting {
    @PrimaryKey()
    id!: number;

    @Property()
    key!: string;

    @Property({ type: 'text' })
    value!: string;

    @Property({ nullable: true })
    description?: string;

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location', { nullable: true })
    location?: any; // Optional: Override per location
}
