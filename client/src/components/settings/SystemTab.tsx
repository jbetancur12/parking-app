import React from 'react';
import { Database, Download, Award, Globe, AlertCircle } from 'lucide-react';

interface SystemTabProps {
    settings: any;
    updateSetting: (key: string, value: any) => void;
    onDownloadBackup: () => void;
    licenseDetails?: any;
    isElectron: boolean;
}

export const SystemTab: React.FC<SystemTabProps> = ({
    settings,
    updateSetting,
    onDownloadBackup,
    licenseDetails,
    isElectron
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Basic Configuration */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Globe className="mr-2 text-brand-blue" size={20} /> Preferencias
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                            <select
                                value={settings.app_timezone || 'America/Bogota'}
                                onChange={(e) => updateSetting('app_timezone', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 bg-white"
                            >
                                <option value="America/Bogota">Bogotá (GMT-5)</option>
                                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                <option value="UTC">UTC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ancho de Impresión</label>
                            <select
                                value={settings.ticket_width || '58mm'}
                                onChange={(e) => updateSetting('ticket_width', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 bg-white"
                            >
                                <option value="58mm">58mm (Estándar)</option>
                                <option value="80mm">80mm (Ancho)</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Imprimir Código QR</span>
                            <input
                                type="checkbox"
                                checked={settings.enable_qr === 'true'}
                                onChange={(e) => updateSetting('enable_qr', String(e.target.checked))}
                                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Mostrar Diálogo de Impresión</span>
                            <input
                                type="checkbox"
                                checked={settings.show_print_dialog === 'true'}
                                onChange={(e) => updateSetting('show_print_dialog', String(e.target.checked))}
                                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                            />
                        </div>
                    </div>
                </div>

                {/* Loyalty Config */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Award className="mr-2 text-yellow-500" size={20} /> Fidelización
                    </h3>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            checked={settings.loyalty_enabled === 'true'}
                            onChange={(e) => updateSetting('loyalty_enabled', String(e.target.checked))}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Habilitar Puntos</span>
                    </div>

                    {settings.loyalty_enabled === 'true' && (
                        <div className="space-y-4 pl-6 border-l-2 border-yellow-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Meta de Visitas</label>
                                <input
                                    type="number"
                                    value={settings.loyalty_target || '10'}
                                    onChange={(e) => updateSetting('loyalty_target', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Recompensa</label>
                                <select
                                    value={settings.loyalty_reward_type || 'FULL'}
                                    onChange={(e) => updateSetting('loyalty_reward_type', e.target.value)}
                                    className="w-full border rounded px-3 py-2 mb-2"
                                >
                                    <option value="FULL">Día Gratis</option>
                                    <option value="HOURS">Horas Gratis</option>
                                </select>
                                {settings.loyalty_reward_type === 'HOURS' && (
                                    <input
                                        type="number"
                                        placeholder="Horas..."
                                        value={settings.loyalty_reward_hours || '0'}
                                        onChange={(e) => updateSetting('loyalty_reward_hours', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* System Maintenance */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Database className="mr-2 text-red-500" size={20} /> Mantenimiento
                    </h3>

                    <button
                        onClick={onDownloadBackup}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Download className="mr-2" size={16} /> Descargar Copia de Seguridad
                    </button>

                    <p className="text-xs text-gray-500 mt-3">
                        Descarga un archivo JSON con toda la base de datos actual para resguardo.
                    </p>
                </div>

                {isElectron && licenseDetails && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="mr-2 text-blue-500" size={20} /> Licencia
                        </h3>
                        <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estado:</span>
                                <span className="font-bold text-green-600">ACTIVA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">ID Hardware:</span>
                                <span className="font-mono text-xs">{licenseDetails.machineId?.substring(0, 16)}...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
