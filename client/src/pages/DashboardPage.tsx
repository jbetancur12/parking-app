import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Play, Square, AlertCircle, X } from 'lucide-react';

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

            // Show summary alert
            const summaryText = `
RESUMEN DE CIERRE DE TURNO

Base Inicial: $${summary.baseAmount.toLocaleString()}
Total Ingresos: $${summary.totalIncome.toLocaleString()}
Total Egresos: $${summary.totalExpenses.toLocaleString()}
---
Efectivo Esperado: $${summary.expectedCash.toLocaleString()}
Efectivo Declarado: $${summary.declaredAmount.toLocaleString()}
Diferencia: $${summary.difference.toLocaleString()} ${summary.difference >= 0 ? '(Sobrante)' : '(Faltante)'}

Transacciones: ${summary.transactionCount}
            `;

            alert(summaryText);
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
        </div>
    );
}
