import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class SystemSetting {
    @PrimaryKey()
    key!: string;

    @Property({ type: 'text' })
    value!: string;

    @Property({ nullable: true })
    description?: string;
}
