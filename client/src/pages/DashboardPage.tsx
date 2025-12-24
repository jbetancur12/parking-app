import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { settingService } from '../services/setting.service';
import { Play, Square, AlertCircle, X, TrendingUp, Users, Clock } from 'lucide-react';
import React from 'react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintShiftSummary } from '../components/PrintShiftSummary';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface Shift {
    id: number;
    startTime: string;
    isActive: boolean;
    baseAmount: number;
}

import { useSaas } from '../context/SaasContext';

export default function DashboardPage() {
    const { user } = useAuth();
    const { currentLocation } = useSaas();
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [baseAmount, setBaseAmount] = useState('');
    const [error, setError] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [declaredAmount, setDeclaredAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [closedShiftData, setClosedShiftData] = useState<any>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [occupancy, setOccupancy] = useState<any>(null);
    const [consolidatedData, setConsolidatedData] = useState<any>(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Print ref for shift summary
    const shiftSummaryRef = React.useRef<HTMLDivElement>(null);

    const handlePrintShiftSummary = useElectronPrint({
        contentRef: shiftSummaryRef,
        silent: settings?.show_print_dialog === 'false'
    });

    useEffect(() => {
        if (!currentLocation) {
            setLoading(false);
            return;
        }

        checkActiveShift();
        fetchOccupancy();
        fetchSettings();

        const interval = setInterval(() => {
            if (currentLocation) fetchOccupancy();
        }, 30000); // Poll every 30s

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            fetchStats();
            fetchConsolidatedStats();
        }
        return () => clearInterval(interval);
    }, [user, currentLocation]);

    const fetchSettings = async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    };

    const fetchConsolidatedStats = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get('/reports/consolidated', { params: { date: today } });
            setConsolidatedData(response.data);
        } catch (error) {
            console.error('Error fetching consolidated stats:', error);
        }
    };

    const fetchOccupancy = async () => {
        try {
            const response = await api.get('/stats/occupancy');
            setOccupancy(response.data);
        } catch (error) {
            console.error('Error fetching occupancy:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/stats/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const checkActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async () => {
        if (!currentLocation) {
            setError('Debe seleccionar una sede activa para iniciar turno');
            return;
        }

        try {
            const response = await api.post('/shifts/open', {
                baseAmount: Number(baseAmount),
                locationId: currentLocation.id
            });
            setActiveShift(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to open shift');
        }
    };

    const handleCloseShift = async () => {
        if (!activeShift) return;

        try {
            const response = await api.post('/shifts/close', {
                declaredAmount: Number(declaredAmount) || 0,
                notes
            });

            const { summary } = response.data;

            // Save data for printing
            setClosedShiftData({
                summary,
                shift: {
                    startTime: activeShift.startTime,
                    endTime: new Date().toISOString()
                },
                user: { username: user?.username || 'Usuario' }
            });

            // Show summary modal instead of alert
            setSummaryData(summary);
            setShowSummaryModal(true);

            setActiveShift(null);
            setShowCloseModal(false);
            setDeclaredAmount('');
            setNotes('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to close shift');
        }
    }

    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido, {user?.username}</h1>

            {/* Multi-Location Summary (Admin Only) */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && consolidatedData && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <Users className="mr-2" size={24} /> Resumen Multi-Sede (Hoy)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
                            <div className="text-sm text-gray-500">Total Ingresos (Global)</div>
                            <div className="text-2xl font-bold text-gray-800">${consolidatedData.globalStats?.totalIncome?.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-600">
                            <div className="text-sm text-gray-500">Transacciones Totales</div>
                            <div className="text-2xl font-bold text-gray-800">{consolidatedData.globalStats?.transactionCount}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
                            <div className="text-sm text-gray-500">Parqueo Total</div>
                            <div className="text-2xl font-bold text-gray-800">${(consolidatedData.globalStats?.parkingHourly + consolidatedData.globalStats?.parkingDaily)?.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                            <div className="text-sm text-gray-500">Sedes Activas</div>
                            <div className="text-2xl font-bold text-gray-800">{consolidatedData.locationStats?.length || 0}</div>
                        </div>
                    </div>

                    {/* Location Breakdown Grid */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Desglose por Sede</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {consolidatedData.locationStats?.map((loc: any) => (
                                <div key={loc.locationId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-800">{loc.locationName}</h4>
                                        <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                            {loc.transactionCount} Tx
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Ingresos:</span>
                                            <span className="font-medium text-green-600">${loc.totalIncome.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Neto:</span>
                                            <span className="font-medium text-blue-600">${(loc.totalIncome - loc.totalExpenses).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Occupancy Widget */}
            {occupancy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Cars */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">Ocupación Carros</h3>
                            <span className="text-2xl font-bold text-blue-600">{occupancy.car.current} <span className="text-sm text-gray-400">/ {occupancy.checkEnabled ? occupancy.car.capacity : '∞'}</span></span>
                        </div>
                        {occupancy.checkEnabled && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${(occupancy.car.current / occupancy.car.capacity) > 0.9 ? 'bg-red-500' :
                                        (occupancy.car.current / occupancy.car.capacity) > 0.7 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min((occupancy.car.current / occupancy.car.capacity) * 100, 100)}%` }}
                                ></div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {occupancy.checkEnabled
                                ? `${occupancy.car.capacity - occupancy.car.current} cupos disponibles`
                                : 'Sin límite de capacidad'}
                        </p>
                    </div>

                    {/* Motorcycles */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">Ocupación Motos</h3>
                            <span className="text-2xl font-bold text-orange-600">{occupancy.motorcycle.current} <span className="text-sm text-gray-400">/ {occupancy.checkEnabled ? occupancy.motorcycle.capacity : '∞'}</span></span>
                        </div>
                        {occupancy.checkEnabled && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${(occupancy.motorcycle.current / occupancy.motorcycle.capacity) > 0.9 ? 'bg-red-500' :
                                        (occupancy.motorcycle.current / occupancy.motorcycle.capacity) > 0.7 ? 'bg-yellow-500' : 'bg-orange-500'
                                        }`}
                                    style={{ width: `${Math.min((occupancy.motorcycle.current / occupancy.motorcycle.capacity) * 100, 100)}%` }}
                                ></div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {occupancy.checkEnabled
                                ? `${occupancy.motorcycle.capacity - occupancy.motorcycle.current} cupos disponibles`
                                : 'Sin límite de capacidad'}
                        </p>
                    </div>
                </div>
            )}

            {/* Dashboard Charts for Admin */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Weekly Income */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                <TrendingUp size={20} className="mr-2 text-green-500" />
                                Ingresos Semanales
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.weeklyIncome}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Ingresos']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Transaction Types */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                <Users size={20} className="mr-2 text-blue-500" />
                                Distribución de Ingresos
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.pieData.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Hourly Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                                <Clock size={20} className="mr-2 text-purple-500" />
                                Actividad por Hora (Últimos 30 días)
                            </h3>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" name="Vehículos" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    {error}
                </div>
            )}

            {!activeShift ? (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
                    <h2 className="text-lg font-semibold mb-4">Iniciar Turno</h2>
                    <p className="text-gray-600 mb-4">Necesita un turno activo para registrar vehículos.</p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base de Caja</label>
                        <input
                            type="number"
                            value={baseAmount}
                            onChange={(e) => setBaseAmount(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                            placeholder="0"
                        />
                    </div>
                    <button
                        onClick={handleOpenShift}
                        className="w-full flex items-center justify-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    >
                        <Play className="mr-2" size={20} />
                        Abrir Turno
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h2 className="text-lg font-semibold text-gray-700">Turno Activo</h2>
                        <p className="text-gray-500 text-sm">Iniciado a las: {new Date(activeShift.startTime).toLocaleString()}</p>
                        <p className="text-gray-500 text-sm mt-2">Base: ${Number(activeShift.baseAmount).toLocaleString()}</p>
                        <div className="mt-4">
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="flex items-center text-red-600 hover:text-red-800 font-medium"
                            >
                                <Square className="mr-2" size={18} /> Cerrar Turno
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
                        <div className="space-y-3">
                            <a href="/parking" className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                Ir al Parqueo
                            </a>
                            <a href="/reports" className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">
                                Ver Reportes
                            </a>
                        </div>
                    </div>


                </div>
            )}

            {/* Close Shift Modal */}
            {showCloseModal && activeShift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Cerrar Turno</h2>
                            <button onClick={() => setShowCloseModal(false)}><X size={20} /></button>
                        </div>

                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Base Inicial</p>
                            <p className="text-2xl font-bold text-blue-600">${Number(activeShift.baseAmount).toLocaleString()}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Efectivo en Caja (Declarado)
                                </label>
                                <input
                                    type="number"
                                    value={declaredAmount}
                                    onChange={(e) => setDeclaredAmount(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas (Opcional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2"
                                    rows={3}
                                    placeholder="Observaciones del turno..."
                                />
                            </div>
                            <button
                                onClick={handleCloseShift}
                                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                            >
                                Confirmar Cierre
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {closedShiftData && (
                    <PrintShiftSummary
                        ref={shiftSummaryRef}
                        summary={closedShiftData.summary}
                        shift={closedShiftData.shift}
                        user={closedShiftData.user}
                        settings={settings}
                    />
                )}
            </div>

            {/* Shift Close Summary Modal */}
            {showSummaryModal && summaryData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Turno Cerrado</h2>

                        <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base Inicial:</span>
                                <span className="font-semibold">${summaryData.baseAmount?.toLocaleString()}</span>
                            </div>

                            {summaryData.cashIncome !== undefined && (
                                <>
                                    <div className="flex justify-between text-green-600">
                                        <span>💵 Ingresos Efectivo:</span>
                                        <span className="font-semibold">${summaryData.cashIncome?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-600">
                                        <span>🏦 Ingresos Transferencia:</span>
                                        <span className="font-semibold">${summaryData.transferIncome?.toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between text-green-600">
                                <span>Total Ingresos:</span>
                                <span className="font-semibold">${summaryData.totalIncome?.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-red-600">
                                <span>Total Egresos:</span>
                                <span className="font-semibold">-${summaryData.totalExpenses?.toLocaleString()}</span>
                            </div>

                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between font-bold">
                                    <span>Efectivo Esperado:</span>
                                    <span className="text-blue-600">${summaryData.expectedCash?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Efectivo Declarado:</span>
                                    <span className="text-purple-600">${summaryData.declaredAmount?.toLocaleString()}</span>
                                </div>
                                <div className={`flex justify-between font-bold text-lg ${summaryData.difference >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    <span>Diferencia:</span>
                                    <span>
                                        {summaryData.difference >= 0 ? '+' : ''}${summaryData.difference?.toLocaleString()}
                                        {summaryData.difference >= 0 ? ' (Sobrante)' : ' (Faltante)'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 text-center pt-2">
                                {summaryData.transactionCount} transacciones
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4 text-center">¿Desea imprimir el resumen del turno?</p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                            >
                                No, gracias
                            </button>
                            <button
                                onClick={() => {
                                    setShowSummaryModal(false);
                                    setTimeout(() => handlePrintShiftSummary(), 100);
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                🖨️ Sí, Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
