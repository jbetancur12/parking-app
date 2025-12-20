import { useEffect, useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { tariffService } from '../services/tariff.service';
import { settingService } from '../services/setting.service';
import type { Tariff } from '../services/tariff.service';

export default function SettingsPage() {
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const [gracePeriod, setGracePeriod] = useState('5');

    useEffect(() => {
        fetchTariffs();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settings = await settingService.getAll();
            if (settings['grace_period']) {
                setGracePeriod(settings['grace_period']);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await settingService.update({ grace_period: gracePeriod });
            setMsg('Grace period saved');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchTariffs = async () => {
        try {
            const data = await tariffService.getAll();
            setTariffs(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await tariffService.update(tariffs);
            setMsg('Settings saved successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!confirm('This will reset tariffs to default values. Continue?')) return;
        try {
            await tariffService.seed();
            fetchTariffs();
            setMsg('Defaults loaded');
        } catch (error) {
            setMsg('Error loading defaults');
        }
    };

    const updateCost = (id: number, val: string) => {
        setTariffs(prev => prev.map(t => t.id === id ? { ...t, cost: Number(val) } : t));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <Settings className="mr-3" /> Configuration
            </h1>

            {msg && (
                <div className={`p-4 rounded-lg mb-6 ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {msg}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Tariffs</h2>
                    <button onClick={handleSeed} className="text-sm text-blue-600 hover:underline flex items-center">
                        <RefreshCw size={14} className="mr-1" /> Reset Defaults
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cars */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Cars</h3>
                        {tariffs.length === 0 && (
                            <p className="text-sm text-red-500 mb-2">No tariffs found. Click "Reset Defaults" above.</p>
                        )}
                        {tariffs.filter(t => t.vehicleType === 'CAR' && t.tariffType !== 'MINUTE').map(t => (
                            <div key={t.id} className="flex justify-between items-center mb-3">
                                <label className="text-gray-600 capitalize">{t.tariffType.toLowerCase()}</label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-2">$</span>
                                    <input
                                        type="number"
                                        value={t.cost}
                                        onChange={(e) => updateCost(t.id, e.target.value)}
                                        className="w-24 border rounded px-2 py-1 text-right"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Motorcycles */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Motorcycles</h3>
                        {tariffs.length === 0 && (
                            <p className="text-sm text-red-500 mb-2">No tariffs found.</p>
                        )}
                        {tariffs.filter(t => t.vehicleType === 'MOTORCYCLE' && t.tariffType !== 'MINUTE').map(t => (
                            <div key={t.id} className="flex justify-between items-center mb-3">
                                <label className="text-gray-600 capitalize">{t.tariffType.toLowerCase()}</label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-2">$</span>
                                    <input
                                        type="number"
                                        value={t.cost}
                                        onChange={(e) => updateCost(t.id, e.target.value)}
                                        className="w-24 border rounded px-2 py-1 text-right"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Save className="mr-2" size={20} />
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Other Settings</h2>

                <div className="flex items-center mb-4">
                    <label className="text-gray-700 w-48 font-medium">Grace Period (Minutes):</label>
                    <input
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(e.target.value)}
                        className="w-24 border rounded px-2 py-1"
                    />
                    <span className="ml-3 text-gray-500 text-sm">Applies after the first hour (hourly plan).</span>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Save className="mr-2" size={20} />
                        Save General Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
