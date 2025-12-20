import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class AuditLog {
    @PrimaryKey()
    id!: number;

    @Property()
    action!: string; // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'

    @Property()
    entity!: string; // e.g., 'MonthlyClient', 'Tariff', 'User'

    @Property({ nullable: true })
    entityId?: string; // ID of the affected entity

    @Property({ nullable: true })
    userId?: number; // ID of the user who performed the action

    @Property({ nullable: true })
    username?: string; // Snapshot of username in case user is deleted

    @Property({ type: 'text', nullable: true })
    details?: string; // JSON string or text description of changes

    @Property({ nullable: true })
    ipAddress?: string;

    @Property({ onCreate: () => new Date() })
    timestamp: Date = new Date();
}
