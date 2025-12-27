import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { settingService } from '../services/setting.service';
import { Play, Square, AlertCircle, X, TrendingUp, Users, Clock } from 'lucide-react';
import React from 'react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintShiftSummary } from '../components/PrintShiftSummary';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from '../components/Skeleton';



import { useSaas } from '../context/SaasContext';

import { useShift } from '../context/ShiftContext';

export default function DashboardPage() {
    const { user } = useAuth();
    const { currentLocation } = useSaas();
    // Use global shift state instead of local
    const { activeShift, checkActiveShift } = useShift();
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

        // Initial fetch handled by Context, but we can force refresh specific dashboard data
        fetchOccupancy();
        fetchSettings();

        const interval = setInterval(() => {
            if (currentLocation) fetchOccupancy();
        }, 30000); // Poll every 30s

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            fetchStats();
            fetchConsolidatedStats();
        }

        // Ensure accurate state on mount
        checkActiveShift().finally(() => setLoading(false));

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

    // Removed local checkActiveShift in favor of context method

    const handleOpenShift = async () => {
        if (!currentLocation) {
            setError('Debe seleccionar una sede activa para iniciar turno');
            return;
        }

        try {
            await api.post('/shifts/open', {
                baseAmount: Number(baseAmount),
                locationId: currentLocation.id
            });
            // Update global context
            await checkActiveShift();
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

            // Update global context
            await checkActiveShift();

            setShowCloseModal(false);
            setDeclaredAmount('');
            setNotes('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to close shift');
        }
    }

    if (loading) return (
        <div>
            <Skeleton className="h-10 w-64 mb-6" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    );
    return (
        <div>
            <h1 className="text-3xl font-display font-bold text-brand-blue mb-6">Bienvenido, {user?.username}</h1>

            {/* ZONA 1: OPERATIVA INMEDIATA */}
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Operativa Inmediata</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Columna 1 & 2: Gestión de Turno */}
                <div className="lg:col-span-2">
                    {!activeShift ? (
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300 h-full flex flex-col justify-center">
                            <h2 className="text-lg font-display font-bold mb-4 text-brand-blue">Iniciar Turno</h2>
                            <p className="text-gray-600 mb-4">Necesita un turno activo para registrar vehículos.</p>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Base de Caja</label>
                                    <input
                                        type="number"
                                        value={baseAmount}
                                        onChange={(e) => setBaseAmount(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
                                        placeholder="0"
                                    />
                                </div>
                                <button
                                    onClick={handleOpenShift}
                                    className="flex-1 bg-brand-green text-white py-2 rounded-lg hover:bg-green-600 font-bold shadow-md transition-transform active:scale-95 flex justify-center items-center h-[42px]"
                                >
                                    <Play className="mr-2" size={20} />
                                    Abrir Turno
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* Turno Activo Card */}
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-green flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-display font-bold text-brand-blue">Turno Activo</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Iniciado: {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-gray-500 text-sm font-medium">Base: ${Number(activeShift.baseAmount).toLocaleString()}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => setShowCloseModal(true)}
                                        className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors flex items-center justify-center border border-red-200"
                                    >
                                        <Square className="mr-2" size={18} /> Cerrar Turno
                                    </button>
                                </div>
                            </div>

                            {/* Acciones Rápidas Card */}
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-center gap-3">
                                <h2 className="text-lg font-display font-bold text-brand-blue mb-1">Acciones Rápidas</h2>
                                <a href="/parking" className="flex items-center justify-center w-full bg-brand-blue text-white py-2 rounded-lg hover:bg-blue-900 font-bold shadow-sm transition-all">
                                    Ir al Parqueo
                                </a>
                                <a href="/reports" className="flex items-center justify-center w-full bg-gray-100 text-brand-blue py-2 rounded-lg hover:bg-gray-200 font-bold transition-all border border-gray-200">
                                    Ver Reportes
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna 3: Ocupación en Tiempo Real */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-brand-yellow">
                    <h3 className="text-lg font-display font-bold text-brand-blue mb-4">Ocupación en Tiempo Real</h3>
                    {occupancy ? (
                        <div className="space-y-6">
                            {/* Cars */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-gray-600">Carros</span>
                                    <span className="text-sm font-bold text-brand-blue">{occupancy.car.current} / {occupancy.checkEnabled ? occupancy.car.capacity : '∞'}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${(occupancy.car.current / occupancy.car.capacity) > 0.9 ? 'bg-red-500' :
                                                (occupancy.car.current / occupancy.car.capacity) > 0.7 ? 'bg-brand-yellow' : 'bg-brand-blue'
                                            }`}
                                        style={{ width: `${occupancy.checkEnabled ? Math.min((occupancy.car.current / occupancy.car.capacity) * 100, 100) : 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Motorcycles */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-gray-600">Motos</span>
                                    <span className="text-sm font-bold text-brand-yellow">{occupancy.motorcycle.current} / {occupancy.checkEnabled ? occupancy.motorcycle.capacity : '∞'}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${(occupancy.motorcycle.current / occupancy.motorcycle.capacity) > 0.9 ? 'bg-red-500' :
                                                (occupancy.motorcycle.current / occupancy.motorcycle.capacity) > 0.7 ? 'bg-brand-yellow' : 'bg-brand-yellow'
                                            }`}
                                        style={{ width: `${occupancy.checkEnabled ? Math.min((occupancy.motorcycle.current / occupancy.motorcycle.capacity) * 100, 100) : 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Skeleton className="h-24 w-full" />
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center font-bold">
                    <AlertCircle className="mr-2" size={20} />
                    {error}
                </div>
            )}


            {/* ZONA 2: KPIS FINANCIEROS (Admin Only) */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && consolidatedData && (
                <>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">KPIs Financieros (Hoy)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-blue">
                            <div className="text-sm font-bold text-gray-500">Total Ingresos (Global)</div>
                            <div className="text-2xl font-bold text-brand-blue">${consolidatedData.globalStats?.totalIncome?.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-green">
                            <div className="text-sm font-bold text-gray-500">Transacciones Totales</div>
                            <div className="text-2xl font-bold text-gray-800">{consolidatedData.globalStats?.transactionCount}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-600">
                            <div className="text-sm font-bold text-gray-500">Parqueo Total</div>
                            <div className="text-2xl font-bold text-gray-800">${(consolidatedData.globalStats?.parkingHourly + consolidatedData.globalStats?.parkingDaily)?.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-yellow">
                            <div className="text-sm font-bold text-gray-500">Sedes Activas</div>
                            <div className="text-2xl font-bold text-gray-800">{consolidatedData.locationStats?.length || 0}</div>
                        </div>
                    </div>

                    {/* ZONA 3: ANÁLISIS PROFUNDO */}
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Análisis Profundo</h2>
                    {stats && (
                        <div className="space-y-6 mb-8">
                            {/* Row 1: Ingresos y Distribución */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Ingresos Semanales (2/3) */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-display font-bold text-brand-blue flex items-center">
                                            <TrendingUp size={20} className="mr-2 text-brand-green" />
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
                                                <Area type="monotone" dataKey="amount" stroke="#28A745" fill="#D1FAE5" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Distribución de Ingresos (1/3) */}
                                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-display font-bold text-brand-blue flex items-center">
                                            <Users size={20} className="mr-2 text-brand-blue" />
                                            Distribución
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
                                                    fill="#1A3A5A"
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
                            </div>

                            {/* Row 2: Actividad y Desglose */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Actividad por Hora (2/3) */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-display font-bold text-brand-blue flex items-center">
                                            <Clock size={20} className="mr-2 text-purple-500" />
                                            Actividad por Hora (30 días)
                                        </h3>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.hourlyData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#F3F4F6' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="count" name="Vehículos" fill="#1A3A5A" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Desglose por Sede (1/3) - Moved here */}
                                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                                    <h3 className="text-lg font-display font-bold text-brand-blue mb-4">Desglose por Sede</h3>
                                    <div className="flex flex-col gap-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {consolidatedData.locationStats?.map((loc: any) => (
                                            <div key={loc.locationId} className="border rounded-lg p-3 hover:bg-brand-blue/5 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-sm text-brand-blue truncate max-w-[120px]" title={loc.locationName}>{loc.locationName}</h4>
                                                    <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                                        {loc.transactionCount} Tx
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Ingresos:</span>
                                                    <span className="font-bold text-brand-green">${loc.totalIncome.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!consolidatedData.locationStats || consolidatedData.locationStats.length === 0) && (
                                            <p className="text-gray-400 text-sm text-center italic mt-10">No hay datos de sedes</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modals and Hidden Components - Keep as is at bottom */}
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
