import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';

export enum VehicleType {
    CAR = 'CAR',
    MOTORCYCLE = 'MOTORCYCLE',
    OTHER = 'OTHER'
}

export enum TariffType {
    MINUTE = 'MINUTE',
    HOUR = 'HOUR',
    DAY = 'DAY',
    NIGHT = 'NIGHT',
    MONTH = 'MONTH',
    WEEK = 'WEEK',
    TWO_WEEKS = 'TWO_WEEKS'
}

export enum PricingModel {
    MINUTE = 'MINUTE',
    BLOCKS = 'BLOCKS',
    TRADITIONAL = 'TRADITIONAL'
}

@Entity()
export class Tariff {
    @PrimaryKey()
    id!: number;

    @Enum(() => VehicleType)
    vehicleType!: VehicleType;

    @Enum(() => TariffType)
    tariffType!: TariffType;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    cost!: number;

    @Enum(() => PricingModel)
    pricingModel: PricingModel = PricingModel.BLOCKS; // Default to old style (simple) or Blocks

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    basePrice: number = 0;

    @Property({ type: 'integer', default: 60 })
    baseTimeMinutes: number = 60; // e.g. 60 min for "First Hour"

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    extraFracPrice: number = 0;

    @Property({ type: 'integer', default: 15 })
    extraFracTimeMinutes: number = 15;

    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    dayMaxPrice?: number;

    @Property({ type: 'integer', nullable: true })
    dayMinHours?: number; // Minimum hours before flat rate applies

    // Optional: for "Full Day" definition or similar
    @Property({ nullable: true })
    description?: string;

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location')
    location!: any;
}
