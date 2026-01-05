import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum NotificationType {
    INFO = 'info',
    WARNING = 'warning',
    DANGER = 'danger'
}

@Entity()
export class SystemNotification {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    @Property()
    title!: string;

    @Property({ type: 'text' })
    message!: string;

    @Enum(() => NotificationType)
    type: NotificationType = NotificationType.INFO;

    @Property({ default: true })
    isActive: boolean = true;

    // Optional: Only show to specific roles (e.g. ['admin', 'operator'])
    // If empty/null, shows to everyone
    @Property({ type: 'json', nullable: true })
    targetRoles?: string[];

    @Property({ nullable: true })
    expiresAt?: Date;

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
