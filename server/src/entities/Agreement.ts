import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum AgreementType {
    FREE_HOURS = 'FREE_HOURS', // e.g., 2 hours free
    PERCENTAGE = 'PERCENTAGE', // e.g., 50% off
    FLAT_DISCOUNT = 'FLAT_DISCOUNT' // e.g., $5000 off
}

@Entity()
export class Agreement {
    @PrimaryKey()
    id!: number;

    @Property()
    name!: string; // e.g., "Restaurante El Tenedor"

    @Enum(() => AgreementType)
    type!: AgreementType;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    value!: number; // 2 (hours), 50 (percent), or 5000 (amount)

    @Property()
    isActive: boolean = true;

    @Property({ nullable: true })
    description?: string;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
