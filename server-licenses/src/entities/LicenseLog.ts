import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { License } from './License';

@Entity()
export class LicenseLog {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => License, { nullable: true })
    license?: License;

    @Property()
    action!: string; // 'INITIAL_ACTIVATION', 'VALIDATE', 'TRIAL_START', 'RENEW', 'REVOKE'

    @Property({ nullable: true })
    hardwareId?: string;

    @Property({ nullable: true })
    ipAddress?: string;

    @Property({ nullable: true })
    userAgent?: string;

    @Property()
    success!: boolean;

    @Property({ nullable: true })
    errorMessage?: string;

    @Property()
    createdAt: Date = new Date();
}
