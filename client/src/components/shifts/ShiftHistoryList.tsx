import React from 'react';
import { Clock, User, Printer } from 'lucide-react';
import { type ClosedShift } from '../../hooks/useShiftHistoryPage';

interface ShiftHistoryListProps {
    shifts: ClosedShift[];
    onPrint: (shift: ClosedShift) => void;
}

export const ShiftHistoryList: React.FC<ShiftHistoryListProps> = ({ shifts, onPrint }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-brand-blue/5">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Duración</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Base</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Ingresos</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Egresos</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Esperado</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Declarado</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Diferencia</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Acción</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {shifts.map((shift) => {
                        const duration = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
                        const hours = Math.floor(duration / (1000 * 60 * 60));
                        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                        return (
                            <tr key={shift.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-brand-blue">#{shift.id}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <User size={16} className="mr-2 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{shift.user.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
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
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-bold">
                                    +${shift.totalIncome.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-bold">
                                    -${shift.totalExpenses.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                    ${shift.expectedCash.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    ${shift.declaredAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`text-sm font-black ${shift.difference >= 0 ? 'text-brand-green' : 'text-red-600'
                                        }`}>
                                        {shift.difference >= 0 ? '+' : ''}${shift.difference.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => onPrint(shift)}
                                        className="text-brand-blue hover:text-white hover:bg-brand-blue bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ml-auto"
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
                            <td colSpan={11} className="px-6 py-12 text-center text-gray-500 font-medium">
                                No hay turnos cerrados disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
