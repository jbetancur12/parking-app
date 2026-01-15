import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { settingService } from '../services/setting.service';
import { tariffService, type Tariff } from '../services/tariff.service';
import api from '../services/api';

export const useSettings = () => {
    // Loading State
    const [loading, setLoading] = useState(false);

    // Global Settings State
    const [settings, setSettingsState] = useState<any>({});

    // Tab State
    const [activeTab, setActiveTab] = useState<'operational' | 'business' | 'system' | 'plan'>('operational');

    // Tariffs State
    const [tariffs, setTariffs] = useState<Tariff[]>([]);

    // License Info
    const [licenseDetails, setLicenseDetails] = useState<any>(null);
    const isElectron = import.meta.env.VITE_APP_MODE === 'electron';

    // --- Fetchers ---

    const fetchSettings = useCallback(async () => {
        try {
            const data = await settingService.getAll();
            setSettingsState(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Error cargando configuración');
        }
    }, []);

    const fetchTariffs = useCallback(async () => {
        try {
            const data = await tariffService.getAll();
            setTariffs(data || []);
        } catch (error) {
            console.error('Error fetching tariffs:', error);
            toast.error('Error cargando tarifas');
        }
    }, []);

    const fetchLicenseDetails = useCallback(async () => {
        if (!isElectron) return;
        try {
            const details = await (window as any).electronAPI?.getLicenseDetails();
            setLicenseDetails(details);
        } catch (e) {
            console.error('Error fetching license:', e);
        }
    }, [isElectron]);

    useEffect(() => {
        fetchSettings();
        fetchTariffs();
        fetchLicenseDetails();
    }, [fetchSettings, fetchTariffs, fetchLicenseDetails]);

    // --- Actions ---

    // Update Local Tariff State
    const updateTariffState = (vehicleType: string, tariffType: string, field: string, value: number | string) => {
        setTariffs(prev => {
            const index = prev.findIndex(t => t.vehicleType === vehicleType && t.tariffType === tariffType);
            if (index >= 0) {
                return prev.map((t, i) => i === index ? { ...t, [field]: value } : t);
            } else {
                // Create new item if not exists
                // Inherit pricing model from other tariffs (Global Model) or default to MINUTE
                const activeModel = prev.length > 0 ? prev[0].pricingModel : 'MINUTE';

                const newItem: any = {
                    vehicleType,
                    tariffType,
                    [field]: value,
                    cost: field === 'cost' ? value : 0,
                    pricingModel: activeModel
                };
                return [...prev, newItem];
            }
        });
    };

    // Update Local Settings State
    const updateSettingState = (key: string, value: any) => {
        setSettingsState((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            // Save settings object directly
            // Note: In original code, there was manual mapping from individual states to API payload.
            // Here we assume 'settings' state mirrors the API payload keys, which we ensure in the components.
            await settingService.update(settings);

            // Save Tariffs
            await tariffService.update(tariffs);

            toast.success('¡Configuración guardada exitosamente!');
        } catch (error) {
            console.error(error);
            toast.error('Error guardando configuración');
        } finally {
            setLoading(false);
        }
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

    return {
        activeTab,
        setActiveTab,
        settings,
        updateSettingState,
        tariffs,
        setTariffs, // Exposed for bulk updates (pricing model)
        updateTariffState,
        loading,
        handleSaveAll,
        handleSeed,
        handleDownloadBackup,
        licenseDetails,
        isElectron
    };
};
