import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { Tenant } from '../entities/Tenant';
import { Location } from '../entities/Location';
import { SettingsInitService } from '../services/SettingsInitService';

/**
 * Migration Script: Backfill Default Settings for Existing Tenants
 * 
 * This script creates default settings for all existing tenant-location combinations
 * that don't already have them.
 */
const backfillSettings = async () => {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        console.log('🔍 Finding all tenants and locations...\n');

        // Get all tenants
        const tenants = await em.find(Tenant, {}, { filters: false });
        console.log(`Found ${tenants.length} tenant(s)\n`);

        let totalCreated = 0;

        for (const tenant of tenants) {
            console.log(`\n📦 Processing Tenant: ${tenant.name} (${tenant.id})`);

            // Get all locations for this tenant
            const locations = await em.find(Location, { tenant: tenant.id }, { filters: false });
            console.log(`   Found ${locations.length} location(s)`);

            if (locations.length === 0) {
                // No locations, create tenant-level settings only
                console.log(`   ⚙️  Creating tenant-level settings...`);
                try {
                    await SettingsInitService.createDefaultSettings(em, tenant.id);
                    totalCreated++;
                    console.log(`   ✅ Tenant-level settings created`);
                } catch (error: any) {
                    if (error.message?.includes('duplicate key')) {
                        console.log(`   ⏭️  Settings already exist for tenant ${tenant.name}`);
                    } else {
                        console.error(`   ❌ Error creating settings:`, error.message);
                    }
                }
            } else {
                // Create location-specific settings for each location
                for (const location of locations) {
                    console.log(`\n   📍 Location: ${location.name} (${location.id})`);
                    try {
                        await SettingsInitService.createDefaultSettings(em, tenant.id, location.id);
                        totalCreated++;
                        console.log(`      ✅ Settings created for ${location.name}`);
                    } catch (error: any) {
                        if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
                            console.log(`      ⏭️  Settings already exist for location ${location.name}`);
                        } else {
                            console.error(`      ❌ Error creating settings:`, error.message);
                        }
                    }
                }
            }
        }

        console.log(`\n\n✅ Migration completed!`);
        console.log(`📊 Total settings created: ${totalCreated}`);
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await orm.close();
    }
};

backfillSettings();
