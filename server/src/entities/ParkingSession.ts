import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { Shift } from './Shift';

export enum VehicleType {
    CAR = 'CAR',
    MOTORCYCLE = 'MOTORCYCLE',
    OTHER = 'OTHER',
}

export enum ParkingStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum PlanType {
    HOUR = 'HOUR',
    DAY = 'DAY'
}

@Entity()
export class ParkingSession {
    @PrimaryKey()
    id!: number;

    @Property()
    plate!: string;

    @Enum(() => VehicleType)
    vehicleType!: VehicleType;

    @Enum(() => PlanType)
    planType: PlanType = PlanType.HOUR; // Default to HOUR

    @Property()
    entryTime: Date = new Date();

    @Property({ nullable: true })
    exitTime?: Date;

    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost?: number;

    @Enum(() => ParkingStatus)
    status: ParkingStatus = ParkingStatus.ACTIVE;

    // Link to the shift that opened this session
    @ManyToOne(() => Shift)
    entryShift!: Shift;

    // Link to the shift that closed this session
    @ManyToOne(() => Shift, { nullable: true })
    exitShift?: Shift;

    @Property({ nullable: true })
    notes?: string;

    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discount?: number;

    @Property({ nullable: true })
    discountReason?: string;

    @ManyToOne(() => 'Agreement', { nullable: true })
    agreement?: any; // Avoiding circular dependency import for now or use require

    // SaaS Relationships
    @ManyToOne(() => 'Tenant')
    tenant!: any;

    @ManyToOne(() => 'Location')
    location!: any;
}
