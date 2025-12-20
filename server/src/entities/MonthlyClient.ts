import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class MonthlyClient {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    plate!: string;

    @Property()
    name!: string;

    @Property({ nullable: true })
    phone?: string;

    @Property({ nullable: true })
    vehicleType?: string;

    @Property()
    startDate!: Date;

    @Property()
    endDate!: Date;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    monthlyRate!: number;

    @Property()
    isActive: boolean = true;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
