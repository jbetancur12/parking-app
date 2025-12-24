import { Entity, PrimaryKey, Property, Enum, ManyToMany, ManyToOne, Collection } from '@mikro-orm/core';
import { Tenant } from './Tenant';
import { Location } from './Location';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN', // Platform owner
    // Tenant roles
    ADMIN = 'ADMIN',             // Tenant owner/manager
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

    // Optional: Keep track of the last selected location for convenience
    @ManyToOne(() => Location, { nullable: true })
    lastActiveLocation?: Location;
}
