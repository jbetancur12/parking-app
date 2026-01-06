import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class FeatureDefinition {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    key!: string; // e.g., 'can_export_reports'

    @Property()
    description!: string; // e.g., 'Permite exportar reportes a Excel'

    @Property({ nullable: true })
    category?: string; // e.g., 'Reports', 'Users', 'System'

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
