import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Play, Square, AlertCircle, X, Printer } from 'lucide-react';
import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { PrintShiftSummary } from '../components/PrintShiftSummary';

interface Shift {
    id: number;
    startTime: string;
    isActive: boolean;
    baseAmount: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(true);
    const [baseAmount, setBaseAmount] = useState('');
    const [error, setError] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [declaredAmount, setDeclaredAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [closedShiftData, setClosedShiftData] = useState<any>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);

    // Print ref for shift summary
    const shiftSummaryRef = React.useRef<HTMLDivElement>(null);

    const handlePrintShiftSummary = useReactToPrint({
        contentRef: shiftSummaryRef,
    });

    useEffect(() => {
        fetchActiveShift();
    }, []);

    const fetchActiveShift = async () => {
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
        try {
            const response = await api.post('/shifts/open', { baseAmount: Number(baseAmount) });
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

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido, {user?.username}</h1>

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
