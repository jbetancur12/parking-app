import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Invoice } from './Invoice';

@Entity()
export class InvoiceItem {
    @PrimaryKey({ type: 'uuid' })
    id = v4();

    @ManyToOne(() => Invoice)
    invoice!: Invoice;

    @Property()
    description!: string;

    @Property({ default: 1 })
    quantity = 1;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice!: number;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number; // quantity * unitPrice

    @Property()
    createdAt = new Date();
}
