import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
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
}
