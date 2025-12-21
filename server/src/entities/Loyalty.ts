import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Loyalty {
    @PrimaryKey()
    plate!: string;

    @Property()
    points: number = 0;

    @Property()
    totalVisits: number = 0;

    @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
    lastVisit: Date = new Date();
}
