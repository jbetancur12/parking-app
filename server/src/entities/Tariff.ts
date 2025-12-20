import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

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
    MONTH = 'MONTH'
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

    // Optional: for "Full Day" definition or similar
    @Property({ nullable: true })
    description?: string;
}
