import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Brand {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    name!: string;

    @Property()
    isActive: boolean = true;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();
}
