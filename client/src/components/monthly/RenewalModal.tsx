import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { type Client } from '../../hooks/useMonthlyClients';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from '../common/CurrencyInput';
import { toast } from 'sonner';

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onRenew: (id: number, data: { amount: number, paymentMethod: string }) => Promise<void>;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose, client, onRenew }) => {
    const [renewAmount, setRenewAmount] = useState('');
    const [renewPaymentMethod, setRenewPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (client) {
            setRenewAmount(client.monthlyRate.toString());
        }
    }, [client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client) return;

        setIsSubmitting(true);
        try {
            await onRenew(client.id, {
                amount: Number(renewAmount),
                paymentMethod: renewPaymentMethod
            });
            onClose();
            toast.success(`Renovado exitosamente (${renewPaymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia'})`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error en renovación');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <RefreshCw className="mr-2 text-green-600" size={20} />
                        Renovar Suscripción
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar</label>
                        <CurrencyInput
                            value={renewAmount}
                            onValueChange={setRenewAmount}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Tarifa actual del cliente: {formatCurrency(Number(client.monthlyRate))}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRenewPaymentMethod('CASH')}
                                className={`py-2 px-4 rounded-lg border font-medium text-sm transition-all ${renewPaymentMethod === 'CASH'
                                    ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                💵 Efectivo
                            </button>
                            <button
                                type="button"
                                onClick={() => setRenewPaymentMethod('TRANSFER')}
                                className={`py-2 px-4 rounded-lg border font-medium text-sm transition-all ${renewPaymentMethod === 'TRANSFER'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                🏦 Transferencia
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-colors mt-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Procesando...' : 'Confirmar Renovación'}
                    </button>
                </form>
            </div>
        </div>
    );
};
