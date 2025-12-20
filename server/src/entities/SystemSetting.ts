import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class SystemSetting {
    @PrimaryKey()
    key!: string;

    @Property()
    value!: string;

    @Property({ nullable: true })
    description?: string;
}
