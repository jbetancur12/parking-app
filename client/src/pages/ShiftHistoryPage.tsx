import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { settingService } from '../services/setting.service';
import { Clock, User, Printer } from 'lucide-react';
import React from 'react';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintShiftSummary } from '../components/PrintShiftSummary';

interface ClosedShift {
    id: number;
    user: {
        id: number;
        username: string;
    };
    startTime: string;
    endTime: string;
    baseAmount: number;
    totalIncome: number;
    totalExpenses: number;
    declaredAmount: number;
    expectedCash: number;
    difference: number;
    notes?: string;
    cashIncome?: number;
    transferIncome?: number;
}

export default function ShiftHistoryPage() {
    const { user: currentUser } = useAuth();
    const [shifts, setShifts] = useState<ClosedShift[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedShift, setSelectedShift] = useState<ClosedShift | null>(null);

    // Print ref
    const shiftSummaryRef = React.useRef<HTMLDivElement>(null);

    const handlePrintShiftSummary = useElectronPrint({ contentRef: shiftSummaryRef });

    useEffect(() => {
        fetchClosedShifts();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    };

    const fetchClosedShifts = async () => {
        try {
            const response = await api.get('/shifts/closed');
            setShifts(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (shift: ClosedShift) => {
        setSelectedShift(shift);
        setTimeout(() => handlePrintShiftSummary(), 100);
    };

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

    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Historial de Turnos</h1>
                <p className="text-gray-600 mt-1">Consulta todos los turnos cerrados</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Egresos</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Esperado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Declarado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {shifts.map((shift) => {
                            const duration = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
                            const hours = Math.floor(duration / (1000 * 60 * 60));
                            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                            return (
                                <tr key={shift.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-blue-600">#{shift.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User size={16} className="mr-2 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">{shift.user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(shift.startTime).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock size={14} className="mr-1" />
                                            {hours}h {minutes}m
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        ${shift.baseAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                                        +${shift.totalIncome.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-medium">
                                        -${shift.totalExpenses.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                                        ${shift.expectedCash.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                        ${shift.declaredAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`text-sm font-bold ${shift.difference >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {shift.difference >= 0 ? '+' : ''}${shift.difference.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handlePrint(shift)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ml-auto"
                                            title="Imprimir resumen"
                                        >
                                            <Printer size={14} />
                                            Imprimir
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {shifts.length === 0 && (
                            <tr>
                                <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                                    No hay turnos cerrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {selectedShift && (
                    <PrintShiftSummary
                        ref={shiftSummaryRef}
                        summary={{
                            baseAmount: selectedShift.baseAmount,
                            totalIncome: selectedShift.totalIncome,
                            totalExpenses: selectedShift.totalExpenses,
                            expectedCash: selectedShift.expectedCash,
                            declaredAmount: selectedShift.declaredAmount,
                            difference: selectedShift.difference,
                            transactionCount: 0, // Not available in history
                            cashIncome: selectedShift.cashIncome,
                            transferIncome: selectedShift.transferIncome
                        }}
                        shift={{
                            startTime: selectedShift.startTime,
                            endTime: selectedShift.endTime
                        }}
                        user={{
                            username: selectedShift.user.username
                        }}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    );
}
