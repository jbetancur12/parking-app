import { useState, useEffect } from 'react';
import {
    Settings, Save, RefreshCw, Shield, Download, Receipt, Building2, Upload,
    Car, Bike, Clock, AlertCircle, Globe, Award, Database
} from 'lucide-react';
import api from '../services/api';
import { tariffService } from '../services/tariff.service';
import { settingService } from '../services/setting.service';
import type { Tariff } from '../services/tariff.service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user: currentUser } = useAuth();
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(false);

    // License Info (Electron only)
    const [licenseDetails, setLicenseDetails] = useState<any>(null);
    const isElectron = import.meta.env.VITE_APP_MODE === 'electron';

    useEffect(() => {
        if (isElectron) {
            fetchLicenseDetails();
        }
    }, []);

    const fetchLicenseDetails = async () => {
        try {
            const details = await (window as any).electronAPI?.getLicenseDetails();
            setLicenseDetails(details);
        } catch (e) {
            console.error('Error fetching license:', e);
        }
    };

    // Tab State
    const [activeTab, setActiveTab] = useState<'operational' | 'business' | 'system'>('operational');

    // General Settings
    const [gracePeriod, setGracePeriod] = useState('5');
    const [checkCapacity, setCheckCapacity] = useState(false);
    const [capacityCar, setCapacityCar] = useState('50');
    const [capacityMoto, setCapacityMoto] = useState('30');

    // Loyalty Settings
    const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
    const [loyaltyTarget, setLoyaltyTarget] = useState('10');
    const [loyaltyRewardType, setLoyaltyRewardType] = useState('FULL'); // FULL or HOURS
    const [loyaltyRewardHours, setLoyaltyRewardHours] = useState('0');

    // Ticket / Company Settings
    const [companyName, setCompanyName] = useState('');
    const [companyNit, setCompanyNit] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [timezone, setTimezone] = useState('America/Bogota');
    const [ticketWidth, setTicketWidth] = useState('58mm'); // 58mm or 80mm
    const [enableQr, setEnableQr] = useState('true');
    const [showPrintDialog, setShowPrintDialog] = useState('true');
    const [regulations, setRegulations] = useState<string[]>(Array(6).fill(''));
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Check permissions
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'LOCATION_MANAGER') {
        return (
            <div className="p-8">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" />
                    No tienes permisos para acceder a esta página.
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetchTariffs();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settings = await settingService.getAll();
            if (settings['grace_period']) setGracePeriod(settings['grace_period']);
            if (settings['check_capacity']) setCheckCapacity(settings['check_capacity'] === 'true');
            if (settings['capacity_car']) setCapacityCar(settings['capacity_car']);
            if (settings['capacity_motorcycle']) setCapacityMoto(settings['capacity_motorcycle']);
            if (settings['loyalty_enabled']) setLoyaltyEnabled(settings['loyalty_enabled'] === 'true');
            if (settings['loyalty_target']) setLoyaltyTarget(settings['loyalty_target']);
            if (settings['loyalty_reward_type']) setLoyaltyRewardType(settings['loyalty_reward_type']);
            if (settings['loyalty_reward_hours']) setLoyaltyRewardHours(settings['loyalty_reward_hours']);

            // Ticket Settings
            if (settings['company_name']) setCompanyName(settings['company_name']);
            if (settings['company_nit']) setCompanyNit(settings['company_nit']);
            if (settings['company_address']) setCompanyAddress(settings['company_address']);
            if (settings['company_phone']) setCompanyPhone(settings['company_phone']);
            if (settings['app_timezone']) setTimezone(settings['app_timezone']);
            if (settings['ticket_width']) setTicketWidth(settings['ticket_width']);
            if (settings['enable_qr']) setEnableQr(settings['enable_qr']);
            if (settings['show_print_dialog']) setShowPrintDialog(settings['show_print_dialog']);
            if (settings['company_logo']) setLogoPreview(settings['company_logo']);

            // Regulations
            const regs = [];
            for (let i = 1; i <= 6; i++) {
                regs.push(settings[`regulation_text_${i}`] || '');
            }
            setRegulations(regs);

        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Error cargando configuración');
        }
    };

    const fetchTariffs = async () => {
        try {
            const data = await tariffService.getAll();
            setTariffs(data || []);
        } catch (error) {
            console.error('Error fetching tariffs:', error);
            toast.error('Error cargando tarifas');
        }
    };

    // Helper function to get tariff by vehicle type and tariff type
    const getTariff = (vehicleType: string, tariffType: string = 'HOUR') => {
        return tariffs.find(t => t.vehicleType === vehicleType && t.tariffType === tariffType);
    };

    // Helper function to update tariff fields specific to a tariff type
    const handleTariffChange = (vehicleType: string, tariffType: string, field: string, value: number | string) => {
        setTariffs(prev => prev.map(t =>
            (t.vehicleType === vehicleType && t.tariffType === tariffType)
                ? { ...t, [field]: value }
                : t
        ));
    };

    // Helper to calculate suggested hours for flat rate threshold
    const calculateSuggestedHours = (tariff: Tariff) => {
        if (!tariff.dayMaxPrice || (tariff.extraFracPrice || 0) <= 0) return null;

        const basePrice = Number(tariff.basePrice) || 0;
        const extraPrice = Number(tariff.extraFracPrice) || 0;
        const dayMax = Number(tariff.dayMaxPrice);
        const baseTime = Number(tariff.baseTimeMinutes) || 60;
        const extraTime = Number(tariff.extraFracTimeMinutes) || 15;

        // If flat rate is less than base price, it applies immediately
        if (dayMax <= basePrice) return (baseTime / 60).toFixed(1);

        // Calculate how many extra blocks are needed to exceed dayMax
        // Cost = Base + (N * Extra)
        // Find N where Cost >= DayMax
        // N * Extra >= DayMax - Base
        // N >= (DayMax - Base) / Extra
        const neededExtras = Math.ceil((dayMax - basePrice) / extraPrice);

        const totalMinutes = baseTime + (neededExtras * extraTime);
        return (totalMinutes / 60).toFixed(1);
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            // 1. General Settings
            await settingService.update({
                grace_period: gracePeriod,
                check_capacity: String(checkCapacity),
                capacity_car: capacityCar,
                capacity_motorcycle: capacityMoto,
                loyalty_enabled: String(loyaltyEnabled),
                loyalty_target: loyaltyTarget,
                loyalty_reward_type: loyaltyRewardType,
                loyalty_reward_hours: loyaltyRewardHours
            });
            // 2. Tariffs
            await tariffService.update(tariffs);
            // 3. Ticket Settings
            const settingsToUpdate: any = {
                company_name: companyName,
                company_nit: companyNit,
                company_address: companyAddress,
                company_phone: companyPhone,
                app_timezone: timezone,
                ticket_width: ticketWidth,
                enable_qr: enableQr,
                show_print_dialog: showPrintDialog,
                company_logo: logoPreview || ''
            };
            regulations.forEach((reg, index) => {
                settingsToUpdate[`regulation_text_${index + 1}`] = reg;
            });
            await settingService.update(settingsToUpdate);

            toast.success('¡Configuración guardada exitosamente!');
        } catch (error) {
            console.error(error);
            toast.error('Error guardando configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegulationChange = (index: number, value: string) => {
        const newRegs = [...regulations];
        newRegs[index] = value;
        setRegulations(newRegs);
    };

    const handleSeed = async () => {
        if (!confirm('Esto restablecerá las tarifas a valores predeterminados. ¿Continuar?')) return;
        try {
            await tariffService.seed();
            fetchTariffs();
            toast.success('Valores por defecto cargados');
        } catch (error) {
            toast.error('Error cargando valores por defecto');
        }
    };



    const handleDownloadBackup = async () => {
        try {
            setLoading(true);
            const response = await api.get('/backup/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success('Copia de seguridad descargada');
        } catch (err) {
            console.error('Error downloading backup:', err);
            toast.error('Error al descargar backup');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="max-w-7xl mx-auto pb-12">

            {/* Header & Main Save Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Settings className="mr-3 text-brand-blue" size={32} /> Configuración
                    </h1>
                    <p className="text-gray-500 mt-1 ml-11">Gestiona todos los parámetros de tu sistema.</p>
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
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('operational')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'operational'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Car className="mr-2" size={18} />
                    Operación
                </button>
                <button
                    onClick={() => setActiveTab('business')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'business'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Building2 className="mr-2" size={18} />
                    Negocio
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex items-center py-4 px-6 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'system'
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Settings className="mr-2" size={18} />
                    Sistema
                </button>
            </div>

            {/* --- TAB: OPERATIONAL --- */}
            {activeTab === 'operational' && (
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
                                <button onClick={handleSeed} className="text-xs text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                    <RefreshCw size={12} className="mr-1" /> Restablecer
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Carros */}
                                <div>
                                    <div className="flex items-center text-lg font-bold text-gray-700">
                                        <Car className="mr-2" size={18} /> Automóviles
                                    </div>
                                    <div className="space-y-3">
                                        {(() => {
                                            const carPricingModel = tariffs.find(t => t.vehicleType === 'CAR')?.pricingModel || 'MINUTE';
                                            return (
                                                <>
                                                    {carPricingModel === 'TRADITIONAL' && (
                                                        <>
                                                            {/* Toggle for Flat Rate */}
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                                                                        <p className="text-xs text-blue-700">Activa para limitar el cobro. Si se superan las horas, se cobra solo la tarifa plena.</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(getTariff('CAR', 'HOUR')?.dayMaxPrice || 0) > 0}
                                                                            onChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMaxPrice', 0);
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMinHours', 0);
                                                                                } else {
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMaxPrice', 1000);
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMinHours', 6);
                                                                                }
                                                                            }}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Conditional Fields */}
                                                            {(getTariff('CAR', 'HOUR')?.dayMaxPrice || 0) > 0 ? (
                                                                // Flat Rate Active
                                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('CAR', 'HOUR')?.dayMaxPrice || 0}
                                                                            onChange={(e) => handleTariffChange('CAR', 'HOUR', 'dayMaxPrice', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('CAR', 'HOUR')?.dayMinHours || 0}
                                                                            onChange={(e) => handleTariffChange('CAR', 'HOUR', 'dayMinHours', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Flat Rate Inactive
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                                                                    <div className="flex justify-between items-center">
                                                                        <label className="text-gray-600 text-sm font-medium">Día Completo (24h)</label>
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                            <input
                                                                                type="number"
                                                                                value={
                                                                                    tariffs.find(t => t.vehicleType === 'CAR' && t.tariffType === 'DAY')?.cost || 0
                                                                                }
                                                                                onChange={(e) => {
                                                                                    const dayT = tariffs.find(t => t.vehicleType === 'CAR' && t.tariffType === 'DAY');
                                                                                    if (dayT) {
                                                                                        handleTariffChange('CAR', 'DAY', 'cost', Number(e.target.value));
                                                                                    }
                                                                                }}
                                                                                className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-2">Usuario elige "Por Hora" o "Por Día" al entrar</p>
                                                                </div>
                                                            )}

                                                            {/* Hour Price - Uses 'cost' field */}
                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                <label className="text-gray-600 text-sm font-medium">Hora / Fracción</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('CAR', 'HOUR')?.cost || 0}
                                                                        onChange={(e) => handleTariffChange('CAR', 'HOUR', 'cost', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    {/* MINUTE MODEL - Uses MINUTE record 'basePrice' */}
                                                    {carPricingModel === 'MINUTE' && (
                                                        <>
                                                            {/* Toggle for Flat Rate (Specific to Minute) */}
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                                                                        <p className="text-xs text-blue-700">Activa para limitar el cobro. Si se superan las horas, se cobra solo la tarifa plena.</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(getTariff('CAR', 'MINUTE')?.dayMaxPrice || 0) > 0}
                                                                            onChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    handleTariffChange('CAR', 'MINUTE', 'dayMaxPrice', 0);
                                                                                    handleTariffChange('CAR', 'MINUTE', 'dayMinHours', 0);
                                                                                } else {
                                                                                    handleTariffChange('CAR', 'MINUTE', 'dayMaxPrice', 1000);
                                                                                    handleTariffChange('CAR', 'MINUTE', 'dayMinHours', 6);
                                                                                }
                                                                            }}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Conditional Fields */}
                                                            {(getTariff('CAR', 'MINUTE')?.dayMaxPrice || 0) > 0 && (
                                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('CAR', 'MINUTE')?.dayMaxPrice || 0}
                                                                            onChange={(e) => handleTariffChange('CAR', 'MINUTE', 'dayMaxPrice', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('CAR', 'MINUTE')?.dayMinHours || 0}
                                                                            onChange={(e) => handleTariffChange('CAR', 'MINUTE', 'dayMinHours', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Price per minute - Always visible */}
                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                <label className="text-gray-600 text-sm font-medium">Por Minuto</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('CAR', 'MINUTE')?.basePrice || 0}
                                                                        onChange={(e) => handleTariffChange('CAR', 'MINUTE', 'basePrice', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    {/* BLOCKS MODEL - Uses HOUR record 'basePrice' */}
                                                    {carPricingModel === 'BLOCKS' && (
                                                        <>
                                                            {/* Toggle for Flat Rate */}
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                                                                        <p className="text-xs text-blue-700">Activa para limitar el cobro. Si se superan las horas, se cobra solo la tarifa plena.</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(getTariff('CAR', 'HOUR')?.dayMaxPrice || 0) > 0}
                                                                            onChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMaxPrice', 0);
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMinHours', 0);
                                                                                } else {
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMaxPrice', 1000);
                                                                                    handleTariffChange('CAR', 'HOUR', 'dayMinHours', 6);
                                                                                }
                                                                            }}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {(getTariff('CAR', 'HOUR')?.dayMaxPrice || 0) > 0 && (
                                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('CAR', 'HOUR')?.dayMaxPrice || 0}
                                                                            onChange={(e) => handleTariffChange('CAR', 'HOUR', 'dayMaxPrice', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('CAR', 'HOUR')?.dayMinHours || 0}
                                                                            onChange={(e) => handleTariffChange('CAR', 'HOUR', 'dayMinHours', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                        {(() => {
                                                                            const t = getTariff('CAR', 'HOUR');
                                                                            if (t && carPricingModel === 'BLOCKS') {
                                                                                const sugg = calculateSuggestedHours(t);
                                                                                if (sugg) {
                                                                                    return <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                                                                                        <span className="text-xs">💡</span> Sugerencia: {sugg}h
                                                                                    </p>;
                                                                                }
                                                                            }
                                                                            return null;
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                    <label className="text-gray-600 text-xs font-medium block mb-1">Minutos Base</label>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('CAR', 'HOUR')?.baseTimeMinutes || 60}
                                                                        onChange={(e) => handleTariffChange('CAR', 'HOUR', 'baseTimeMinutes', Number(e.target.value))}
                                                                        className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                    <label className="text-gray-600 text-xs font-medium block mb-1">Minutos Fracción</label>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('CAR', 'HOUR')?.extraFracTimeMinutes || 15}
                                                                        onChange={(e) => handleTariffChange('CAR', 'HOUR', 'extraFracTimeMinutes', Number(e.target.value))}
                                                                        className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors mb-2">
                                                                <label className="text-gray-600 text-sm font-medium">Precio Base (1ra Hora)</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('CAR', 'HOUR')?.basePrice || 0}
                                                                        onChange={(e) => handleTariffChange('CAR', 'HOUR', 'basePrice', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                <label className="text-gray-600 text-sm font-medium">Extra Fracción</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('CAR', 'HOUR')?.extraFracPrice || 0}
                                                                        onChange={(e) => handleTariffChange('CAR', 'HOUR', 'extraFracPrice', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Motos */}
                                <div>
                                    <div className="flex items-center text-lg font-bold text-gray-700">
                                        <Bike className="mr-2" size={18} /> Motocicletas
                                    </div>
                                    <div className="space-y-3">
                                        {(() => {
                                            const motoPricingModel = tariffs.find(t => t.vehicleType === 'MOTORCYCLE')?.pricingModel || 'MINUTE';
                                            return (
                                                <>
                                                    {motoPricingModel === 'TRADITIONAL' && (
                                                        <>
                                                            {/* Toggle for Flat Rate */}
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                                                                        <p className="text-xs text-blue-700">Activa para limitar el cobro. Si se superan las horas, se cobra solo la tarifa plena.</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(getTariff('MOTORCYCLE', 'HOUR')?.dayMaxPrice || 0) > 0}
                                                                            onChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMaxPrice', 0);
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMinHours', 0);
                                                                                } else {
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMaxPrice', 1000);
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMinHours', 6);
                                                                                }
                                                                            }}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Conditional Fields */}
                                                            {(getTariff('MOTORCYCLE', 'HOUR')?.dayMaxPrice || 0) > 0 ? (
                                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('MOTORCYCLE', 'HOUR')?.dayMaxPrice || 0}
                                                                            onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMaxPrice', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('MOTORCYCLE', 'HOUR')?.dayMinHours || 0}
                                                                            onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMinHours', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                                                                    <div className="flex justify-between items-center">
                                                                        <label className="text-gray-600 text-sm font-medium">Día Completo (24h)</label>
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                            <input
                                                                                type="number"
                                                                                value={tariffs.find(t => t.vehicleType === 'MOTORCYCLE' && t.tariffType === 'DAY')?.cost || 0}
                                                                                onChange={(e) => handleTariffChange('MOTORCYCLE', 'DAY', 'cost', Number(e.target.value))}
                                                                                className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-2">Usuario elige "Por Hora" o "Por Día" al ingresar</p>
                                                                </div>
                                                            )}

                                                            {/* Hour Price - Always visible */}
                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                <label className="text-gray-600 text-sm font-medium">Hora / Fracción</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('MOTORCYCLE', 'HOUR')?.cost || 0}
                                                                        onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'cost', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    {motoPricingModel === 'MINUTE' && (
                                                        <>
                                                            {/* Toggle for Flat Rate */}
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                                                                        <p className="text-xs text-blue-700">Activa para limitar el cobro. Si se superan las horas, se cobra solo la tarifa plena.</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(getTariff('MOTORCYCLE', 'MINUTE')?.dayMaxPrice || 0) > 0}
                                                                            onChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    handleTariffChange('MOTORCYCLE', 'MINUTE', 'dayMaxPrice', 0);
                                                                                    handleTariffChange('MOTORCYCLE', 'MINUTE', 'dayMinHours', 0);
                                                                                } else {
                                                                                    handleTariffChange('MOTORCYCLE', 'MINUTE', 'dayMaxPrice', 1000);
                                                                                    handleTariffChange('MOTORCYCLE', 'MINUTE', 'dayMinHours', 6);
                                                                                }
                                                                            }}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Conditional Fields */}
                                                            {(getTariff('MOTORCYCLE', 'MINUTE')?.dayMaxPrice || 0) > 0 && (
                                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('MOTORCYCLE', 'MINUTE')?.dayMaxPrice || 0}
                                                                            onChange={(e) => handleTariffChange('MOTORCYCLE', 'MINUTE', 'dayMaxPrice', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('MOTORCYCLE', 'MINUTE')?.dayMinHours || 0}
                                                                            onChange={(e) => handleTariffChange('MOTORCYCLE', 'MINUTE', 'dayMinHours', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Price per minute - Always visible */}
                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                <label className="text-gray-600 text-sm font-medium">Por Minuto</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('MOTORCYCLE', 'MINUTE')?.basePrice || 0}
                                                                        onChange={(e) => handleTariffChange('MOTORCYCLE', 'MINUTE', 'basePrice', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    {motoPricingModel === 'BLOCKS' && (
                                                        <>
                                                            {/* Toggle for Flat Rate */}
                                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-blue-900 mb-1">Tarifa Plena (Cap Opcional)</p>
                                                                        <p className="text-xs text-blue-700">Activa para limitar el cobro. Si se superan las horas, se cobra solo la tarifa plena.</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(getTariff('MOTORCYCLE', 'HOUR')?.dayMaxPrice || 0) > 0}
                                                                            onChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMaxPrice', 0);
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMinHours', 0);
                                                                                } else {
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMaxPrice', 1000);
                                                                                    handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMinHours', 6);
                                                                                }
                                                                            }}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Conditional Fields */}
                                                            {(getTariff('MOTORCYCLE', 'HOUR')?.dayMaxPrice || 0) > 0 && (
                                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Tarifa Plena $</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('MOTORCYCLE', 'HOUR')?.dayMaxPrice || 0}
                                                                            onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMaxPrice', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                        <label className="text-gray-600 text-xs font-medium block mb-1">Desde (horas)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={getTariff('MOTORCYCLE', 'HOUR')?.dayMinHours || 0}
                                                                            onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'dayMinHours', Number(e.target.value))}
                                                                            className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                        />
                                                                        {(() => {
                                                                            const t = getTariff('MOTORCYCLE', 'HOUR');
                                                                            if (t && motoPricingModel === 'BLOCKS') {
                                                                                const sugg = calculateSuggestedHours(t);
                                                                                if (sugg) {
                                                                                    return <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                                                                                        <span className="text-xs">💡</span> Sugerencia: {sugg}h
                                                                                    </p>;
                                                                                }
                                                                            }
                                                                            return null;
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Block prices - Always visible */}
                                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                    <label className="text-gray-600 text-xs font-medium block mb-1">Minutos Base</label>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('MOTORCYCLE', 'HOUR')?.baseTimeMinutes || 60}
                                                                        onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'baseTimeMinutes', Number(e.target.value))}
                                                                        className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                                <div className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                    <label className="text-gray-600 text-xs font-medium block mb-1">Minutos Fracción</label>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('MOTORCYCLE', 'HOUR')?.extraFracTimeMinutes || 15}
                                                                        onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'extraFracTimeMinutes', Number(e.target.value))}
                                                                        className="w-full px-2 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors mb-2">
                                                                <label className="text-gray-600 text-sm font-medium">Precio Base (1ra Hora)</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('MOTORCYCLE', 'HOUR')?.basePrice || 0}
                                                                        onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'basePrice', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-transparent hover:border-blue-200 transition-colors">
                                                                <label className="text-gray-600 text-sm font-medium">Extra Fracción</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={getTariff('MOTORCYCLE', 'HOUR')?.extraFracPrice || 0}
                                                                        onChange={(e) => handleTariffChange('MOTORCYCLE', 'HOUR', 'extraFracPrice', Number(e.target.value))}
                                                                        className="w-28 pl-6 pr-3 py-1.5 text-right bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Capacity & Control */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-base font-semibold text-gray-900 flex items-center">
                                    <Clock className="mr-2 text-gray-500" size={18} /> Tiempos y Cupos
                                </h2>
                            </div>
                            <div className="p-5 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Gracia (Minutos)</label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={gracePeriod}
                                            onChange={(e) => setGracePeriod(e.target.value)}
                                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <span className="ml-3 text-xs text-gray-400">Libres tras cumplir la hora.</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-700">Control de Aforo</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={checkCapacity} onChange={(e) => setCheckCapacity(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className={`space-y-3 transition-opacity ${!checkCapacity ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm text-gray-600 flex items-center"><Car size={14} className="mr-1" /> Cupo Carros</label>
                                            <input type="number" value={capacityCar} onChange={(e) => setCapacityCar(e.target.value)} className="w-20 border rounded-md px-2 py-1 text-right text-sm" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm text-gray-600 flex items-center"><Bike size={14} className="mr-1" /> Cupo Motos</label>
                                            <input type="number" value={capacityMoto} onChange={(e) => setCapacityMoto(e.target.value)} className="w-20 border rounded-md px-2 py-1 text-right text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Loyalty Section (Moved here) */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Award className="mr-2 text-yellow-500" size={20} /> Fidelización
                                </h2>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={loyaltyEnabled} onChange={(e) => setLoyaltyEnabled(e.target.checked)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                            <div className={`p-6 space-y-4 transition-opacity ${!loyaltyEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta de Visitas</label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={loyaltyTarget}
                                            onChange={(e) => setLoyaltyTarget(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg py-2 px-3"
                                            placeholder="Ej: 10"
                                        />
                                        <span className="ml-3 text-sm text-gray-500 flex-shrink-0">visitas para premio</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Premio</label>
                                        <select
                                            value={loyaltyRewardType}
                                            onChange={(e) => setLoyaltyRewardType(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg py-2 px-3"
                                        >
                                            <option value="FULL">Salida Gratis</option>
                                            <option value="HOURS">Horas Gratis</option>
                                        </select>
                                    </div>
                                    {loyaltyRewardType === 'HOURS' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cant. Horas</label>
                                            <input
                                                type="number"
                                                value={loyaltyRewardHours}
                                                onChange={(e) => setLoyaltyRewardHours(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg py-2 px-3"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: BUSINESS --- */}
            {activeTab === 'business' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    {/* Left Column: identity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Building2 className="mr-2 text-brand-blue" size={20} /> Identidad del Negocio
                            </h2>
                            <p className="text-sm text-gray-500">Esta información aparecerá en el encabezado del ticket.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Ej: Cuadra Parking"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIT / ID</label>
                                    <input
                                        type="text"
                                        value={companyNit}
                                        onChange={(e) => setCompanyNit(e.target.value)}
                                        className="block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Ej: 900.123.456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={companyPhone}
                                        onChange={(e) => setCompanyPhone(e.target.value)}
                                        className="block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Ej: 300 123 4567"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
                                <input
                                    type="text"
                                    value={companyAddress}
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Ej: Calle 123 # 45-67"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Logo del Ticket</label>
                                <div className="flex items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    {logoPreview ? (
                                        <div className="relative group mr-4">
                                            <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain bg-white rounded-lg border p-1" />
                                            <button onClick={() => setLogoPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-3 h-3 flex items-center justify-center">x</div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-gray-400">
                                            <Upload size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors inline-block text-center w-full">
                                            Subir Imagen
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </label>
                                        <p className="text-xs text-gray-400 mt-2 text-center">Recomendado: Imagen B/N pequeña.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ticket Customization */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Receipt className="mr-2 text-purple-600" size={20} /> Personalización del Ticket
                            </h2>
                            <p className="text-sm text-gray-500">Ajustes de impresión y leyendas legales.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ancho Papel</label>
                                    <select
                                        value={ticketWidth}
                                        onChange={(e) => setTicketWidth(e.target.value)}
                                        className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                    >
                                        <option value="58mm">58mm (Estándar)</option>
                                        <option value="80mm">80mm (Grande)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Código QR</label>
                                    <select
                                        value={enableQr}
                                        onChange={(e) => setEnableQr(e.target.value)}
                                        className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                    >
                                        <option value="true">Mostrar QR</option>
                                        <option value="false">Ocultar</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Modo Impresión</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <button
                                        onClick={() => setShowPrintDialog('true')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-l-lg border ${showPrintDialog === 'true' ? 'bg-blue-50 border-blue-200 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Diálogo
                                    </button>
                                    <button
                                        onClick={() => setShowPrintDialog('false')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${showPrintDialog === 'false' ? 'bg-blue-50 border-blue-200 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Silenciosa
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">
                                    {showPrintDialog === 'false' ? 'Imprime directamente a la impresora predeterminada.' : 'Muestra el selector de impresora en cada ticket.'}
                                </p>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-sm font-medium text-gray-900 mb-3">Reglamento (Letra pequeña)</label>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    {regulations.map((reg, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="text-xs text-gray-400 w-4 text-right">{idx + 1}</span>
                                            <input
                                                type="text"
                                                value={reg}
                                                onChange={(e) => handleRegulationChange(idx, e.target.value)}
                                                className="block w-full border-none bg-white rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-1 focus:ring-blue-500"
                                                placeholder={`Línea ${idx + 1} del reglamento...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: SYSTEM --- */}
            {activeTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">

                    {/* Localization & Loyalty */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Globe className="mr-2 text-indigo-500" size={20} /> Regional
                                </h2>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-4"
                                >
                                    <option value="America/Bogota">America/Bogota (Colombia)</option>
                                    <option value="America/New_York">America/New_York (USA ET)</option>
                                    <option value="Europe/Madrid">Europe/Madrid (España)</option>
                                    <option value="UTC">UTC (Universal)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">Afecta la hora impresa en los tickets y reportes.</p>
                            </div>
                        </div>


                    </div>

                    {/* Security & License */}
                    <div className="space-y-6">
                        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Database className="mr-2 text-green-600" size={20} /> Datos y Seguridad
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-gray-600 mb-4">Descarga una copia completa de tu base de datos local.</p>
                                    <button onClick={handleDownloadBackup} disabled={loading} className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                                        <Download size={18} className="mr-2" />
                                        {loading ? 'Generando...' : 'Descargar Backup (.json)'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isElectron && licenseDetails && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Shield className="mr-2 text-red-600" size={20} /> Licencia
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm text-gray-500">Cliente</span>
                                        <span className="text-sm font-medium text-gray-900">{licenseDetails.customerName}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm text-gray-500">Tipo</span>
                                        <span className="text-sm font-medium text-gray-900">{licenseDetails.type === 'trial' ? 'Prueba' : 'Pro'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm text-gray-500">Vence</span>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${new Date(licenseDetails.expiresAt) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                                                {new Date(licenseDetails.expiresAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {Math.ceil((new Date(licenseDetails.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días días
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}
