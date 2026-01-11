import { Entity, PrimaryKey, Property, Enum, ManyToMany, ManyToOne, Collection } from '@mikro-orm/core';
import { Tenant } from './Tenant';
import { Location } from './Location';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN', // Platform owner
    // Tenant roles
    ADMIN = 'ADMIN',             // Tenant owner/manager
    LOCATION_MANAGER = 'LOCATION_MANAGER', // Managed specific locations
    OPERATOR = 'OPERATOR',
    CASHIER = 'CASHIER',
}

@Entity()
export class User {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    username!: string;

    @Property()
    password!: string;

    @Enum(() => UserRole)
    role!: UserRole;

    @Property()
    isActive: boolean = true;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    // SaaS Relationships
    // A user can be assigned to multiple tenants (companies)
    @ManyToMany(() => Tenant, 'users', { owner: true })
    tenants = new Collection<Tenant>(this);

    // A user can be assigned to multiple locations within a tenant
    @ManyToMany(() => Location, 'users', { owner: true })
    locations = new Collection<Location>(this);

    // Track last login for activity metrics
    @Property({ nullable: true })
    lastLoginAt?: Date;

    // Optional: Keep track of the last selected location for convenience
    // Optional: Keep track of the last selected location for convenience
    @ManyToOne(() => Location, { nullable: true })
    lastActiveLocation?: Location;

    // Password Reset / Activation
    @Property({ nullable: true })
    resetPasswordToken?: string;

    @Property({ nullable: true })
    resetPasswordExpires?: Date;

    // Security: Token Version for Global Logout
    @Property({ default: 0 })
    tokenVersion: number = 0;
}
