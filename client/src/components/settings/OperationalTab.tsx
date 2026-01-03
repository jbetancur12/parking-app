import React from 'react';
import { Settings, Car, Bike, Receipt, RefreshCw } from 'lucide-react';
import { type Tariff } from '../../services/tariff.service';
import { CurrencyInput } from '../common/CurrencyInput';

interface OperationalTabProps {
    tariffs: Tariff[];
    setTariffs: React.Dispatch<React.SetStateAction<Tariff[]>>;
    getTariff: (vehicle: string, type?: string) => Tariff | undefined;
    handleTariffChange: (vehicle: string, type: string, field: string, value: any) => void;
    calculateSmartSuggestion: (tariff: Tariff, type: 'HOURS_FROM_PRICE' | 'PRICE_FROM_HOURS') => string | null;
    settings: any;
    updateSetting: (key: string, value: any) => void;
    onSeed: () => void;
}

export const OperationalTab: React.FC<OperationalTabProps> = ({
    tariffs,
    setTariffs,
    getTariff,
    handleTariffChange,
    calculateSmartSuggestion,
    settings,
    updateSetting,
    onSeed
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Tariffs Section */}
            <div className="md:col-span-2 space-y-6">
                {/* Global Pricing Model Selector */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Settings size={18} className="text-gray-600" />
                                Modelo de Tarificación Global
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Este modelo se aplicará a todos los tipos de vehículos.
                            </p>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                            {[
                                { value: 'MINUTE', label: 'Por Minuto' },
                                { value: 'BLOCKS', label: 'Por Bloques' },
                                { value: 'TRADITIONAL', label: 'Tradicional' }
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setTariffs(prev => prev.map(t => ({ ...t, pricingModel: value as any })));
                                    }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${tariffs[0]?.pricingModel === value
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Receipt className="mr-2 text-brand-blue" size={20} /> Tarifas de Parqueo
                            </h2>
                            <p className="text-sm text-gray-500">Define los precios por fracción para cada vehículo.</p>
                        </div>
                        <button onClick={onSeed} className="text-xs text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            <RefreshCw size={12} className="mr-1" /> Restablecer
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Carros */}
                        <TariffBlock
                            title="Automóviles"
                            icon={<Car className="mr-2" size={18} />}
                            vehicleType="CAR"
                            tariffs={tariffs}
                            getTariff={getTariff}
                            handleTariffChange={handleTariffChange}
                            calculateSmartSuggestion={calculateSmartSuggestion}
                        />

                        {/* Motos */}
                        <TariffBlock
                            title="Motocicletas"
                            icon={<Bike className="mr-2" size={18} />}
                            vehicleType="MOTORCYCLE"
                            tariffs={tariffs}
                            getTariff={getTariff}
                            handleTariffChange={handleTariffChange}
                            calculateSmartSuggestion={calculateSmartSuggestion}
                        />
                    </div>
                </div>
            </div>

            {/* General Settings Sidebar */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Settings className="mr-2 text-gray-500" size={18} /> General
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiempo de Gracia (min)
                            </label>
                            <input
                                type="number"
                                value={settings.grace_period || ''}
                                onChange={(e) => updateSetting('grace_period', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tiempo libre antes de cobrar.</p>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Control de Capacidad</label>
                                <input
                                    type="checkbox"
                                    checked={settings.check_capacity === 'true'}
                                    onChange={(e) => updateSetting('check_capacity', String(e.target.checked))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                            {settings.check_capacity === 'true' && (
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                        <label className="text-xs block text-gray-600">Cupos Carro</label>
                                        <input
                                            type="number"
                                            value={settings.capacity_car || ''}
                                            onChange={(e) => updateSetting('capacity_car', e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs block text-gray-600">Cupos Moto</label>
                                        <input
                                            type="number"
                                            value={settings.capacity_motorcycle || ''}
                                            onChange={(e) => updateSetting('capacity_motorcycle', e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for Tariff Block to reduce duplication
const TariffBlock: React.FC<any> = ({
    title, icon, vehicleType, tariffs, getTariff, handleTariffChange, calculateSmartSuggestion
}) => {
    const pricingModel = tariffs.find((t: any) => t.vehicleType === vehicleType)?.pricingModel || 'MINUTE';




    return (
        <div>
            <div className="flex items-center text-lg font-bold text-gray-700 mb-3">
                {icon} {title}
            </div>
            <div className="space-y-3">
                {/* Logic per Pricing Model */}
                {/* Common Flat Rate Toggle & Logic */}
                {['TRADITIONAL', 'BLOCKS', 'MINUTE'].includes(pricingModel) && (
                    <>
                        {/* Toggle Checkbox Logic would go here - simplified for brevity, assume passed logic matches parent */}
                        {/* NOTE: Replicating the exact logic from SettingsPage needed here */}
                        {/* For brevity in this artifact, I will focus on structure. Logic is copied from original below */}
                    </>
                )}
                {/* Re-implementing the exact form fields from SettingsPage for this block */}
                {renderTariffFields(vehicleType, pricingModel, getTariff, handleTariffChange, calculateSmartSuggestion)}
            </div>
        </div>
    );
};

// Helper function to render specific fields based on model
const renderTariffFields = (vehicleType: string, pricingModel: string, getTariff: any, handleTariffChange: any, calculateSmartSuggestion: any) => {
    const tHour = getTariff(vehicleType, 'HOUR');
    const tMinute = getTariff(vehicleType, 'MINUTE');
    const tDay = getTariff(vehicleType, 'DAY');

    const handleDayRateToggle = (checked: boolean) => {
        const type = pricingModel === 'MINUTE' ? 'MINUTE' : 'HOUR';
        if (!checked) {
            handleTariffChange(vehicleType, type, 'dayMaxPrice', 0);
            handleTariffChange(vehicleType, type, 'dayMinHours', 0);
        } else {
            handleTariffChange(vehicleType, type, 'dayMaxPrice', 1000);
            handleTariffChange(vehicleType, type, 'dayMinHours', 6);
        }
    };

    const isDayRateActive = (pricingModel === 'MINUTE' ? tMinute?.dayMaxPrice : tHour?.dayMaxPrice) > 0;

    return (
        <>
            {/* Toggle for Flat Rate */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                        <p className="text-xs text-blue-700">Activa para limitar el cobro.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                            type="checkbox"
                            checked={isDayRateActive}
                            onChange={(e) => handleDayRateToggle(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {isDayRateActive && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                        <CurrencyInput
                            value={(pricingModel === 'MINUTE' ? tMinute?.dayMaxPrice : tHour?.dayMaxPrice) || 0}
                            onValueChange={(val) => handleTariffChange(vehicleType, pricingModel === 'MINUTE' ? 'MINUTE' : 'HOUR', 'dayMaxPrice', Number(val))}
                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {/* Suggestion Logic */}
                        {(() => {
                            const t = pricingModel === 'MINUTE' ? tMinute : tHour;
                            if (t) {
                                const suggHours = calculateSmartSuggestion(t, 'HOURS_FROM_PRICE');
                                if (suggHours) return <p className="text-[10px] text-blue-600 mt-1">💡 ~{suggHours}h</p>;
                            }
                        })()}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                        <input
                            type="number"
                            value={(pricingModel === 'MINUTE' ? tMinute?.dayMinHours : tHour?.dayMinHours) || 0}
                            onChange={(e) => handleTariffChange(vehicleType, pricingModel === 'MINUTE' ? 'MINUTE' : 'HOUR', 'dayMinHours', Number(e.target.value))}
                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {/* Suggestion Logic */}
                        {(() => {
                            const t = pricingModel === 'MINUTE' ? tMinute : tHour;
                            if (t) {
                                const suggPrice = calculateSmartSuggestion(t, 'PRICE_FROM_HOURS');
                                if (suggPrice) return <p className="text-[10px] text-green-600 mt-1">💰 ${Number(suggPrice).toLocaleString()}</p>;
                            }
                        })()}
                    </div>
                </div>
            )}

            {!isDayRateActive && pricingModel === 'TRADITIONAL' && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                    <div className="flex justify-between items-center">
                        <label className="text-gray-600 text-sm font-medium">Día Completo (24h)</label>
                        <CurrencyInput
                            value={tDay?.cost || 0}
                            onValueChange={(val) => handleTariffChange(vehicleType, 'DAY', 'cost', Number(val))}
                            className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Model Specific Fields */}
            {pricingModel === 'TRADITIONAL' && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                    <label className="text-gray-600 text-sm font-medium">Hora / Fracción</label>
                    <CurrencyInput
                        value={tHour?.cost || 0}
                        onValueChange={(val) => handleTariffChange(vehicleType, 'HOUR', 'cost', Number(val))}
                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}

            {pricingModel === 'MINUTE' && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                    <label className="text-gray-600 text-sm font-medium">Por Minuto</label>
                    <CurrencyInput
                        value={tMinute?.basePrice || 0}
                        onValueChange={(val) => handleTariffChange(vehicleType, 'MINUTE', 'basePrice', Number(val))}
                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}

            {pricingModel === 'BLOCKS' && (
                <>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                            <label className="text-gray-600 text-xs font-medium block mb-1">Minutos Base</label>
                            <input
                                type="number"
                                value={tHour?.baseTimeMinutes || 60}
                                onChange={(e) => handleTariffChange(vehicleType, 'HOUR', 'baseTimeMinutes', Number(e.target.value))}
                                className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                            <label className="text-gray-600 text-xs font-medium block mb-1">Minutos Fracción</label>
                            <input
                                type="number"
                                value={tHour?.extraFracTimeMinutes || 15}
                                onChange={(e) => handleTariffChange(vehicleType, 'HOUR', 'extraFracTimeMinutes', Number(e.target.value))}
                                className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors mb-2">
                        <label className="text-gray-600 text-sm font-medium">Precio Base (1ra Hora)</label>
                        <CurrencyInput
                            value={tHour?.basePrice || 0}
                            onValueChange={(val) => handleTariffChange(vehicleType, 'HOUR', 'basePrice', Number(val))}
                            className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                        <label className="text-gray-600 text-sm font-medium">Extra Fracción</label>
                        <CurrencyInput
                            value={tHour?.extraFracPrice || 0}
                            onValueChange={(val) => handleTariffChange(vehicleType, 'HOUR', 'extraFracPrice', Number(val))}
                            className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </>
            )}
        </>
    );
};
