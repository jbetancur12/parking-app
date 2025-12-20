import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Shield, Download } from 'lucide-react';
import api from '../services/api';
import { tariffService } from '../services/tariff.service';
import { settingService } from '../services/setting.service';
import type { Tariff } from '../services/tariff.service';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { user: currentUser } = useAuth();
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [gracePeriod, setGracePeriod] = useState('5');
    const [checkCapacity, setCheckCapacity] = useState(false);
    const [capacityCar, setCapacityCar] = useState('50');
    const [capacityMoto, setCapacityMoto] = useState('30');

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
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchTariffs = async () => {
        try {
            const data = await tariffService.getAll();
            console.log('Tariffs fetched:', data);
            setTariffs(data || []);
        } catch (error) {
            console.error('Error fetching tariffs:', error);
            setMsg('Error cargando tarifas');
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await settingService.update({
                grace_period: gracePeriod,
                check_capacity: String(checkCapacity),
                capacity_car: capacityCar,
                capacity_motorcycle: capacityMoto
            });
            setMsg('Configuración guardada correctamente');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Error guardando ajustes');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await tariffService.update(tariffs);
            setMsg('Configuración guardada exitosamente');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Error guardando ajustes');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (!confirm('Esto restablecerá las tarifas a valores predeterminados. ¿Continuar?')) return;
        try {
            await tariffService.seed();
            fetchTariffs();
            setMsg('Valores por defecto cargados');
        } catch (error) {
            setMsg('Error cargando valores por defecto');
        }
    };

    const updateCost = (id: number, val: string) => {
        setTariffs(prev => prev.map(t => t.id === id ? { ...t, cost: Number(val) } : t));
    };

    const handleDownloadBackup = async () => {
        try {
            setLoading(true);
            const response = await api.get('/backup/export', { responseType: 'blob' });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            setMsg('Copia de seguridad descargada correctamente');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error('Error downloading backup:', err);
            setMsg('Error al descargar la copia de seguridad.');
        } finally {
            setLoading(false);
        }
    };

    const carTariffs = tariffs.filter(t => t.vehicleType === 'CAR' && t.tariffType !== 'MINUTE');
    const motoTariffs = tariffs.filter(t => t.vehicleType === 'MOTORCYCLE' && t.tariffType !== 'MINUTE');

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <Settings className="mr-3" /> Configuración
            </h1>

            {msg && (
                <div className={`p-4 rounded-lg mb-6 ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {msg}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Tarifas</h2>
                    <button onClick={handleSeed} className="text-sm text-blue-600 hover:underline flex items-center">
                        <RefreshCw size={14} className="mr-1" /> Restablecer Valores
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cars */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Carros</h3>
                        {tariffs.length === 0 && (
                            <p className="text-sm text-red-500 mb-2">Cargando o no hay tarifas...</p>
                        )}
                        {carTariffs.length === 0 && tariffs.length > 0 && (
                            <p className="text-sm text-gray-500">No hay tarifas de carro visibles.</p>
                        )}
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

                    {/* Motorcycles */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Motos</h3>
                        {motoTariffs.length === 0 && tariffs.length > 0 && (
                            <p className="text-sm text-gray-500">No hay tarifas de moto visibles.</p>
                        )}
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

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Save className="mr-2" size={20} />
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Otras Configuraciones</h2>

                <div className="flex items-center mb-6 border-b pb-4">
                    <label className="text-gray-700 w-48 font-medium">Tiempo de Gracia (Minutos):</label>
                    <input
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(e.target.value)}
                        className="w-24 border rounded px-2 py-1"
                    />
                    <span className="ml-3 text-gray-500 text-sm">Aplica después de la primera hora.</span>
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
                            <input
                                type="number"
                                value={capacityCar}
                                onChange={(e) => setCapacityCar(e.target.value)}
                                className="w-24 border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="text-gray-700 w-32">Cupo Motos:</label>
                            <input
                                type="number"
                                value={capacityMoto}
                                onChange={(e) => setCapacityMoto(e.target.value)}
                                className="w-24 border rounded px-2 py-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <Save className="mr-2" size={20} />
                        Guardar Ajustes
                    </button>
                </div>

                {/* Security & Backup Section - Only for Admin/SuperAdmin */}
                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-2">
                            <Shield className="mr-2 text-purple-600" size={24} />
                            Seguridad y Datos
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="font-medium text-gray-900 mb-2">Copia de Seguridad (Backup)</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Descarga una copia completa de la base de datos en formato JSON.
                                    Guarda este archivo en un lugar seguro.
                                </p>
                                <button
                                    onClick={handleDownloadBackup}
                                    disabled={loading}
                                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                >
                                    <Download size={16} className="mr-2" />
                                    {loading ? 'Generando...' : 'Descargar Copia de Seguridad'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
