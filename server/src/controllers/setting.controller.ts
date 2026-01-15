import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { SystemSetting } from '../entities/SystemSetting';
import { AuditService } from '../services/AuditService';
import { logger } from '../utils/logger';

export class SystemSettingController {

    // Get all settings (Hierarchical: Global -> Tenant -> Location)
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            // 1. Fetch System Defaults (Global)
            const globalSettings = await em.find(SystemSetting, { tenant: null, location: null });

            // 2. Fetch Tenant Defaults
            const tenantSettings = tenantId
                ? await em.find(SystemSetting, { tenant: tenantId, location: null })
                : [];

            // 3. Fetch Location Overrides
            const locationSettings = (tenantId && locationId)
                ? await em.find(SystemSetting, { tenant: tenantId, location: locationId })
                : [];

            const map: Record<string, string> = {};

            // Merge in order of precedence: Global < Tenant < Location
            globalSettings.forEach(s => map[s.key] = s.value);
            tenantSettings.forEach(s => map[s.key] = s.value);
            locationSettings.forEach(s => map[s.key] = s.value);

            // Default Grace Period if not set anywhere
            if (!map['grace_period']) map['grace_period'] = '5';

            res.json(map);
        } catch (error) {
            logger.error({ error }, 'Error fetching settings');
            res.status(500).json({ message: 'Error fetching settings' });
        }
    }

    // Update settings (Saves to specific level based on context)
    async update(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const tenantId = req.headers['x-tenant-id'];
            const locationIdRaw = req.headers['x-location-id'];
            const locationId = Array.isArray(locationIdRaw) ? locationIdRaw[0] : locationIdRaw;

            if (!tenantId || !locationId) {
                return res.status(400).json({ message: 'Context required to update settings' });
            }

            const updates: Record<string, string> = req.body;
            const tenant = await em.getReference('Tenant', tenantId);
            const location = await em.getReference('Location', locationId);

            for (const [key, value] of Object.entries(updates)) {
                // Upsert for specific location
                let setting = await em.findOne(SystemSetting, {
                    key,
                    tenant: tenantId,
                    location: locationId
                });

                if (!setting) {
                    setting = em.create(SystemSetting, {
                        key,
                        value: String(value),
                        tenant,
                        location
                    });
                    em.persist(setting);
                } else {
                    setting.value = String(value);
                }
            }

            await em.flush();


            await AuditService.log(
                em,
                'UPDATE_SETTINGS',
                'SystemSetting',
                'Global',
                (req as any).user,
                updates,
                req
            );

            res.json({ message: 'Settings updated for this location' });
        } catch (error) {
            logger.error({ error }, 'Error updating settings');
            res.status(500).json({ message: 'Error updating settings' });
        }
    }
}
