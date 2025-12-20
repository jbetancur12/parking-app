import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Shift } from './Shift';

@Entity()
export class Expense {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Shift)
    shift!: Shift;

    @Property()
    description!: string;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();
}
