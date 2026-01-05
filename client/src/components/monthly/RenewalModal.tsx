import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { type Client } from '../../hooks/business/useMonthlyClients';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm shadow-xl animate-fade-in-up border dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <RefreshCw className="mr-2 text-green-600 dark:text-green-400" size={20} />
                        Renovar Suscripción
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Pagar</label>
                        <CurrencyInput
                            value={renewAmount}
                            onValueChange={setRenewAmount}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 transition-colors"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tarifa actual del cliente: {formatCurrency(Number(client.monthlyRate))}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRenewPaymentMethod('CASH')}
                                className={`py-2 px-4 rounded-lg border font-medium text-sm transition-all ${renewPaymentMethod === 'CASH'
                                    ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-400 dark:text-green-300 ring-1 ring-green-500 dark:ring-green-400'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                            >
                                💵 Efectivo
                            </button>
                            <button
                                type="button"
                                onClick={() => setRenewPaymentMethod('TRANSFER')}
                                className={`py-2 px-4 rounded-lg border font-medium text-sm transition-all ${renewPaymentMethod === 'TRANSFER'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 ring-1 ring-blue-500 dark:ring-blue-400'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
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
