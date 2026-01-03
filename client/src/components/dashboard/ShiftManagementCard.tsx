import React from 'react';
import { Play, Square } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ShiftManagementCardProps {
    activeShift: any;
    baseAmount: string;
    onBaseAmountChange: (value: string) => void;
    onOpenShift: () => void;
    onCloseShiftRequire: () => void;
}

export const ShiftManagementCard: React.FC<ShiftManagementCardProps> = ({
    activeShift,
    baseAmount,
    onBaseAmountChange,
    onOpenShift,
    onCloseShiftRequire
}) => {
    if (!activeShift) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300 h-full flex flex-col justify-center">
                <h2 className="text-lg font-display font-bold mb-4 text-brand-blue">Iniciar Turno</h2>
                <p className="text-gray-600 mb-4">Necesita un turno activo para registrar vehículos.</p>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Base de Caja</label>
                        <input
                            type="number"
                            value={baseAmount}
                            onChange={(e) => onBaseAmountChange(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-blue transition-shadow"
                            placeholder="0"
                        />
                    </div>
                    <button
                        onClick={onOpenShift}
                        className="flex-1 bg-brand-green text-white py-2 rounded-lg hover:bg-green-600 font-bold shadow-md transition-transform active:scale-95 flex justify-center items-center h-[42px]"
                    >
                        <Play className="mr-2" size={20} />
                        Abrir Turno
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Turno Activo Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-green flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-display font-bold text-brand-blue">Turno Activo</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Iniciado: {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-gray-500 text-sm font-medium">Base: {formatCurrency(Number(activeShift.baseAmount))}</p>
                </div>
                <div className="mt-4">
                    <button
                        onClick={onCloseShiftRequire}
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
    );
};
