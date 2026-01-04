import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CurrencyInput } from '../common/CurrencyInput';

interface CloseShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseAmount: string | number;
    onConfirm: (declaredAmount: number, notes: string) => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
    isOpen,
    onClose,
    baseAmount,
    onConfirm
}) => {
    const [declaredAmount, setDeclaredAmount] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Cerrar Turno</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Base Inicial</p>
                    <p className="text-2xl font-bold text-blue-600">${Number(baseAmount).toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Efectivo en Caja (Declarado)
                        </label>
                        <CurrencyInput
                            value={declaredAmount}
                            onValueChange={setDeclaredAmount}
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
                        onClick={() => onConfirm(Number(declaredAmount), notes)}
                        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 font-bold shadow-sm"
                    >
                        Confirmar Cierre
                    </button>
                </div>
            </div>
        </div>
    );
};
