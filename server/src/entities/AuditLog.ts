import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';

export type AuditAction =
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DELETE'
    | 'PASSWORD_CHANGE'
    | 'TARIFF_CREATE'
    | 'TARIFF_UPDATE'
    | 'TARIFF_DELETE'
    | 'SHIFT_OPEN'
    | 'SHIFT_CLOSE'
    | 'UPDATE_SETTINGS'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT';

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

    // SaaS Relationships
    @ManyToOne(() => 'Tenant', { nullable: true })
    tenant?: any; // Nullable because some system audits might be global

    @ManyToOne(() => 'Location', { nullable: true })
    location?: any;
}
