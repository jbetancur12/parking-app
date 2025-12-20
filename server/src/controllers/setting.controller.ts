import { Request, Response } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { SystemSetting } from '../entities/SystemSetting';

export class SystemSettingController {

    // Get all settings
    async getAll(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const settings = await em.find(SystemSetting, {});
            const map: Record<string, string> = {};
            settings.forEach(s => map[s.key] = s.value);

            // Default Grace Period if not set
            if (!map['grace_period']) map['grace_period'] = '5';

            res.json(map);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching settings' });
        }
    }

    // Update settings
    async update(req: Request, res: Response) {
        try {
            const em = RequestContext.getEntityManager();
            if (!em) return res.status(500).json({ message: 'No EM' });

            const updates: Record<string, string> = req.body;

            for (const [key, value] of Object.entries(updates)) {
                let setting = await em.findOne(SystemSetting, { key });
                if (!setting) {
                    setting = em.create(SystemSetting, { key, value: String(value) });
                    em.persist(setting);
                } else {
                    setting.value = String(value);
                }
            }

            await em.flush();
            res.json({ message: 'Settings updated' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating settings' });
        }
    }
}
