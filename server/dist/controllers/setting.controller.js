"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingController = void 0;
const core_1 = require("@mikro-orm/core");
const SystemSetting_1 = require("../entities/SystemSetting");
class SystemSettingController {
    // Get all settings
    async getAll(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const settings = await em.find(SystemSetting_1.SystemSetting, {});
            const map = {};
            settings.forEach(s => map[s.key] = s.value);
            // Default Grace Period if not set
            if (!map['grace_period'])
                map['grace_period'] = '5';
            res.json(map);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching settings' });
        }
    }
    // Update settings
    async update(req, res) {
        try {
            const em = core_1.RequestContext.getEntityManager();
            if (!em)
                return res.status(500).json({ message: 'No EM' });
            const updates = req.body;
            for (const [key, value] of Object.entries(updates)) {
                let setting = await em.findOne(SystemSetting_1.SystemSetting, { key });
                if (!setting) {
                    setting = em.create(SystemSetting_1.SystemSetting, { key, value: String(value) });
                    em.persist(setting);
                }
                else {
                    setting.value = String(value);
                }
            }
            await em.flush();
            res.json({ message: 'Settings updated' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating settings' });
        }
    }
}
exports.SystemSettingController = SystemSettingController;
