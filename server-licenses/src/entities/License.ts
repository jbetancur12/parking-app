import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

export type LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked';
export type LicenseType = 'trial' | 'full';

@Entity()
export class License {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    licenseKey!: string; // PARK-XXXX-XXXX-XXXX-XXXX

    @Property()
    customerId!: string; // UUID

    @Property()
    customerName!: string;

    @Property()
    customerEmail!: string;

    @Property()
    issuedAt: Date = new Date();

    @Property()
    expiresAt!: Date;

    @Property({ nullable: true })
    hardwareId?: string;

    @Property({ nullable: true })
    activatedAt?: Date;

    @Property({ nullable: true })
    lastValidatedAt?: Date;

    @Property()
    maxLocations: number = 1;

    @Property({ type: 'json' })
    features: string[] = [];

    @Property()
    status: LicenseStatus = 'pending';

    @Property()
    type: LicenseType = 'full';

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
