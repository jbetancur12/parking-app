import { EntityManager } from '@mikro-orm/core';
import { SystemSetting } from '../entities/SystemSetting';
import { logger } from '../utils/logger';

/**
 * Service to initialize default settings for new tenants and locations
 */
export class SettingsInitService {
    /**
     * Creates default settings for a tenant/location
     * @param em Entity Manager
     * @param tenantId Tenant ID
     * @param locationId Optional location ID (if creating location-specific settings)
     */
    static async createDefaultSettings(
        em: EntityManager,
        tenantId: string,
        locationId?: string
    ): Promise<void> {
        const tenant = await em.getReference('Tenant', tenantId);
        const location = locationId ? await em.getReference('Location', locationId) : null;

        // Default settings configuration
        const defaultSettings = [
            // Preferences
            { key: 'app_timezone', value: 'America/Bogota' },
            { key: 'ticket_width', value: '58mm' },
            { key: 'enable_qr', value: 'false' },
            { key: 'show_print_dialog', value: 'false' },

            // General
            { key: 'grace_period', value: '5' },
            { key: 'check_capacity', value: 'false' },
            { key: 'capacity_car', value: '50' },
            { key: 'capacity_motorcycle', value: '30' },

            // Loyalty Program
            { key: 'loyalty_enabled', value: 'false' },
            { key: 'loyalty_target', value: '10' },
            { key: 'loyalty_reward_type', value: 'FULL' },
            { key: 'loyalty_reward_hours', value: '0' },

            // Ticket Header (use tenant name as default)
            { key: 'ticket_header', value: 'PARQUEADERO' },
        ];

        // Create settings in database
        for (const settingData of defaultSettings) {
            const setting = em.create(SystemSetting, {
                key: settingData.key,
                value: settingData.value,
                tenant,
                location
            });
            em.persist(setting);
        }

        await em.flush();

        logger.info(`Default settings created for tenant ${tenantId}${locationId ? ` / location ${locationId}` : ''}`);
    }
}
