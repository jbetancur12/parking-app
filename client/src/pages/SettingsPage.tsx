import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, Download, Receipt, Building2, Upload } from 'lucide-react';
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

    // Tab State
    const [activeTab, setActiveTab] = useState<'tariffs' | 'ticket'>('tariffs');

    // General Settings
    const [gracePeriod, setGracePeriod] = useState('5');
    const [checkCapacity, setCheckCapacity] = useState(false);
    const [capacityCar, setCapacityCar] = useState('50');
    const [capacityMoto, setCapacityMoto] = useState('30');

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
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        return (
            <div className="p-8">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
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

    const handleSaveGeneral = async () => {
        setLoading(true);
        try {
            await settingService.update({
                grace_period: gracePeriod,
                check_capacity: String(checkCapacity),
                capacity_car: capacityCar,
                capacity_motorcycle: capacityMoto
            });
            await tariffService.update(tariffs);
            toast.success('Configuración general guardada');
        } catch (error) {
            toast.error('Error guardando ajustes generales');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTicket = async () => {
        setLoading(true);
        try {
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
            toast.success('Configuración de ticket guardada');
        } catch (error) {
            toast.error('Error guardando configuración de ticket');
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

    const updateCost = (id: number, val: string) => {
        setTariffs(prev => prev.map(t => t.id === id ? { ...t, cost: Number(val) } : t));
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

    const carTariffs = tariffs.filter(t => t.vehicleType === 'CAR' && t.tariffType !== 'MINUTE');
    const motoTariffs = tariffs.filter(t => t.vehicleType === 'MOTORCYCLE' && t.tariffType !== 'MINUTE');

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <Settings className="mr-3" /> Configuración
            </h1>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('tariffs')}
                    className={`flex items-center py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'tariffs'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Settings className="mr-2" size={16} />
                    Tarifas y Cupos
                </button>
                <button
                    onClick={() => setActiveTab('ticket')}
                    className={`flex items-center py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'ticket'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Receipt className="mr-2" size={16} />
                    Ticket y Empresa
                </button>
            </div>

            {/* TAB CONTENT: TARIFFS & GENERAL */}
            {activeTab === 'tariffs' && (
                <div className="animate-fade-in">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Tarifas de Parqueo</h2>
                            <button onClick={handleSeed} className="text-sm text-blue-600 hover:underline flex items-center">
                                <RefreshCw size={14} className="mr-1" /> Restablecer Valores
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Carros</h3>
                                {carTariffs.map(t => (
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
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Motos</h3>
                                {motoTariffs.map(t => (
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
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ajustes Generales</h2>
                        <div className="flex items-center mb-6 border-b pb-4">
                            <label className="text-gray-700 w-48 font-medium">Tiempo de Gracia (Min):</label>
                            <input
                                type="number"
                                value={gracePeriod}
                                onChange={(e) => setGracePeriod(e.target.value)}
                                className="w-24 border rounded px-2 py-1"
                            />
                            <span className="ml-3 text-gray-500 text-sm">Minutos libres después de cumplir la hora.</span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Gestión de Cupos</h3>
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    checked={checkCapacity}
                                    onChange={(e) => setCheckCapacity(e.target.checked)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                />
                                <label className="text-gray-700 font-medium">Limitar entrada (verificar cupo disponible)</label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!checkCapacity ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex items-center">
                                    <label className="text-gray-700 w-32">Cupo Carros:</label>
                                    <input type="number" value={capacityCar} onChange={(e) => setCapacityCar(e.target.value)} className="w-24 border rounded px-2 py-1" />
                                </div>
                                <div className="flex items-center">
                                    <label className="text-gray-700 w-32">Cupo Motos:</label>
                                    <input type="number" value={capacityMoto} onChange={(e) => setCapacityMoto(e.target.value)} className="w-24 border rounded px-2 py-1" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Zona Horaria (Reportes)</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                                >
                                    <option value="America/Bogota">America/Bogota (Colombia)</option>
                                    <option value="America/New_York">America/New_York (USA ET)</option>
                                    <option value="Europe/Madrid">Europe/Madrid (España)</option>
                                    <option value="UTC">UTC (Universal)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={handleSaveGeneral} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                                <Save className="mr-2" size={20} /> Guardar Cambios
                            </button>
                        </div>
                    </div>

                    {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-2">
                                <Shield className="mr-2 text-purple-600" size={24} /> Seguridad y Datos
                            </h2>
                            <button onClick={handleDownloadBackup} disabled={loading} className="flex items-center justify-center w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                                <Download size={16} className="mr-2" /> Descargar Copia de Seguridad
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: TICKET & COMPANY */}
            {activeTab === 'ticket' && (
                <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
                            <Building2 className="mr-2" /> Datos de Empresa
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ej: Aparca Parking"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIT / Identificación</label>
                            <input
                                type="text"
                                value={companyNit}
                                onChange={(e) => setCompanyNit(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ej: 900.123.456-7"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input
                                type="text"
                                value={companyAddress}
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ej: Calle 123 # 45-67"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="text"
                                value={companyPhone}
                                onChange={(e) => setCompanyPhone(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ej: 300 123 4567"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Personalización Ticket</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ancho Papel</label>
                                    <select
                                        value={ticketWidth}
                                        onChange={(e) => setTicketWidth(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="58mm">58mm (Estándar)</option>
                                        <option value="80mm">80mm (Grande)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mostrar QR</label>
                                    <select
                                        value={enableQr}
                                        onChange={(e) => setEnableQr(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="true">Sí, mostrar QR</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div className="mt-4 col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Diálogo de Impresión</label>
                                    <select
                                        value={showPrintDialog}
                                        onChange={(e) => setShowPrintDialog(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="true">Mostrar diálogo (Seleccionar impresora)</option>
                                        <option value="false">Impresión directa (Silenciosa)</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        "Impresión directa" usará la impresora predeterminada del sistema sin preguntar.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Ticket (Opcional)</label>
                                <div className="flex items-center space-x-4">
                                    {logoPreview && (
                                        <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 object-contain border rounded bg-gray-50" />
                                    )}
                                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                        <Upload className="h-4 w-4 inline-block mr-1" />
                                        Subir Logo
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                    {logoPreview && (
                                        <button onClick={() => setLogoPreview(null)} className="text-red-600 text-xs hover:underline">Eliminar</button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Recomendado: Imagen B/N pequeña.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Regulations & Preview */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Reglamento (Letra pequeña)</h3>
                        <p className="text-xs text-gray-500 mb-2">Estas líneas aparecerán al final del ticket.</p>

                        {regulations.map((reg, idx) => (
                            <div key={idx}>
                                <label className="block text-xs font-medium text-gray-500">Línea {idx + 1}</label>
                                <input
                                    type="text"
                                    value={reg}
                                    onChange={(e) => handleRegulationChange(idx, e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
                                    placeholder={`Texto reglamento línea ${idx + 1}...`}
                                />
                            </div>
                        ))}

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={handleSaveTicket}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-lg"
                            >
                                <Save className="mr-2" size={20} />
                                Guardar Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
