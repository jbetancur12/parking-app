
import {
    Settings, Save, Car, Building2, AlertCircle, TrendingUp
} from 'lucide-react';
import type { Tariff } from '../services/tariff.service';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';

// Child Components
import { OperationalTab } from '../components/settings/OperationalTab';
import { BusinessTab } from '../components/settings/BusinessTab';
import { SystemTab } from '../components/settings/SystemTab';
import { PlanUsageTab } from '../components/settings/PlanUsageTab';


export default function SettingsPage() {
    const { user: currentUser } = useAuth();

    const {
        activeTab,
        setActiveTab,
        settings,
        updateSettingState,
        tariffs,
        setTariffs,
        updateTariffState,
        loading,
        handleSaveAll,
        handleSeed,
        handleDownloadBackup,
        licenseDetails,
        isElectron
    } = useSettings();

    // Permissions Check
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'LOCATION_MANAGER') {
        return (
            <div className="p-8">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" />
                    No tienes permisos para acceder a esta página.
                </div>
            </div>
        );
    }

    // --- Helper Logic from Original Page (passed down) ---
    const getTariff = (vehicleType: string, tariffType: string = 'HOUR') => {
        return tariffs.find(t => t.vehicleType === vehicleType && t.tariffType === tariffType);
    };

    const calculateSmartSuggestion = (tariff: Tariff, type: 'HOURS_FROM_PRICE' | 'PRICE_FROM_HOURS') => {
        // Logic reused from original...
        const pricingModel = tariff.pricingModel || 'MINUTE';
        const dayMax = Number(tariff.dayMaxPrice) || 0;
        const dayMinHours = Number(tariff.dayMinHours) || 0;
        const basePrice = Number(tariff.basePrice) || 0;
        const costPerHour = Number(tariff.cost) || 0;
        const extraPrice = Number(tariff.extraFracPrice) || 0;
        const extraTime = Number(tariff.extraFracTimeMinutes) || 15;
        const baseTime = Number(tariff.baseTimeMinutes) || 60;

        if (type === 'HOURS_FROM_PRICE') {
            if (dayMax <= 0) return null;
            if (pricingModel === 'MINUTE') {
                if (basePrice <= 0) return null;
                const hours = (dayMax / basePrice) / 60;
                return hours.toFixed(1);
            }
            if (pricingModel === 'TRADITIONAL') {
                if (costPerHour <= 0) return null;
                const hours = dayMax / costPerHour;
                return hours.toFixed(1);
            }
            if (pricingModel === 'BLOCKS') {
                if (dayMax <= basePrice) return (baseTime / 60).toFixed(1);
                if (extraPrice <= 0) return null;
                const neededBlocks = (dayMax - basePrice) / extraPrice;
                const totalMinutes = baseTime + (neededBlocks * extraTime);
                return (totalMinutes / 60).toFixed(1);
            }
        }

        if (type === 'PRICE_FROM_HOURS') {
            if (dayMinHours <= 0) return null;
            if (pricingModel === 'MINUTE') {
                const price = dayMinHours * 60 * basePrice;
                return Math.ceil(price).toString();
            }
            if (pricingModel === 'TRADITIONAL') {
                const price = dayMinHours * costPerHour;
                return Math.ceil(price).toString();
            }
            if (pricingModel === 'BLOCKS') {
                const totalMinutes = dayMinHours * 60;
                if (totalMinutes <= baseTime) return basePrice.toString();
                const extraMinutes = totalMinutes - baseTime;
                const extraBlocks = Math.ceil(extraMinutes / extraTime);
                const price = basePrice + (extraBlocks * extraPrice);
                return Math.ceil(price).toString();
            }
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header & Main Save Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Settings className="mr-3 text-brand-blue" size={32} /> Configuración
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 ml-11">Gestiona todos los parámetros de tu sistema.</p>
                </div>

                <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className={`bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-opacity-90 flex items-center shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}`}
                >
                    <Save className="mr-2" size={20} />
                    {loading ? 'Guardando...' : 'Guardar Todo'}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('operational')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'operational'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-blue-900/20 rounded-t-lg'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <Car className="mr-2" size={18} />
                    Operación
                </button>
                <button
                    onClick={() => setActiveTab('business')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'business'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-blue-900/20 rounded-t-lg'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <Building2 className="mr-2" size={18} />
                    Negocio
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'system'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-blue-900/20 rounded-t-lg'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <Settings className="mr-2" size={18} />
                    Sistema
                </button>
                <button
                    onClick={() => setActiveTab('plan')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'plan'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-blue-900/20 rounded-t-lg'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                >
                    <TrendingUp className="mr-2" size={18} />
                    Plan y Uso
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'operational' && (
                <OperationalTab
                    tariffs={tariffs}
                    setTariffs={setTariffs}
                    getTariff={getTariff}
                    handleTariffChange={updateTariffState}
                    calculateSmartSuggestion={calculateSmartSuggestion}
                    settings={settings}
                    updateSetting={updateSettingState}
                    onSeed={handleSeed}
                />
            )}

            {activeTab === 'business' && (
                <BusinessTab
                    settings={settings}
                    updateSetting={updateSettingState}
                />
            )}

            {activeTab === 'system' && (
                <SystemTab
                    settings={settings}
                    updateSetting={updateSettingState}
                    onDownloadBackup={handleDownloadBackup}
                    licenseDetails={licenseDetails}
                    isElectron={isElectron}
                />
            )}

            {activeTab === 'plan' && (
                <PlanUsageTab />
            )}
        </div>
    );
}
