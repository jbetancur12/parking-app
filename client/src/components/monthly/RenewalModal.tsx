import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { type Client } from '../../hooks/business/useMonthlyClients';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from '../common/CurrencyInput';
import { toast } from 'sonner';
import { tariffService, type Tariff } from '../../services/tariff.service';

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onRenew: (id: number, data: { amount: number, paymentMethod: string, billingPeriod?: string }) => Promise<void>;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose, client, onRenew }) => {
    const [renewAmount, setRenewAmount] = useState('');
    const [renewPaymentMethod, setRenewPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [billingPeriod, setBillingPeriod] = useState('MONTH');
    const [startDateMode, setStartDateMode] = useState<'CONTINUE' | 'TODAY'>('CONTINUE');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tariffs, setTariffs] = useState<Tariff[]>([]);

    useEffect(() => {
        if (isOpen) {
            tariffService.getAll().then(setTariffs).catch(console.error);
        }
    }, [isOpen]);

    useEffect(() => {
        if (client) {
            setRenewAmount(client.monthlyRate.toString());
            setBillingPeriod(client.billingPeriod || 'MONTH');
            setStartDateMode('CONTINUE'); // Reset to default
        }
    }, [client, isOpen]); // Reset on Open too

    // Auto-update rate when period changes
    useEffect(() => {
        if (!client || !billingPeriod || tariffs.length === 0) return;

        // Prevent auto-update if it matches current client setting initially (handled by above effect on mount)
        // But if user changes dropdown, we should update.
        // Simple logic: If existing client has this period, default to their rate? No, Tariffs might have changed.
        // Better: Always fetch from tariff table if period changes.

        const vType = client.vehicleType || 'CAR';
        const tariff = tariffs.find(t => t.vehicleType === vType && t.tariffType === billingPeriod);

        if (tariff) {
            setRenewAmount(tariff.cost.toString());
        }
    }, [billingPeriod, tariffs, client?.vehicleType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client) return;

        setIsSubmitting(true);
        try {
            // Determine Start Date
            let startDate: string | undefined = undefined;
            if (startDateMode === 'CONTINUE') {
                startDate = client.endDate; // Backend handles null/string conversion if needed, but passing explicit ensures intent
            } else {
                startDate = new Date().toISOString(); // Start Today
            }

            await onRenew(client.id, {
                amount: Number(renewAmount),
                paymentMethod: renewPaymentMethod,
                billingPeriod,
                startDate // Pass to parent handler
            } as any); // Type assertion until interface updated globally
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

                    {/* Start Date Strategy Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inicio de Renovación</label>
                        <div className="space-y-2">
                            {/* Option 1: Continue (Default/Ideal) */}
                            <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${startDateMode === 'CONTINUE' ? 'bg-green-50 border-green-500 ring-1 ring-green-500 dark:bg-green-900/30 dark:border-green-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                <input
                                    type="radio"
                                    name="startDateMode"
                                    className="mt-1 mr-3 text-green-600 focus:ring-green-500"
                                    checked={startDateMode === 'CONTINUE'}
                                    onChange={() => setStartDateMode('CONTINUE')}
                                />
                                <div>
                                    <span className="block text-sm font-bold text-gray-900 dark:text-white">Continuar ({new Date(client.endDate).toLocaleDateString()})</span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        Mantiene la continuidad. {new Date(client.endDate) < new Date() ? 'Cobrará los días vencidos (hueco).' : 'Extiende desde el final actual.'}
                                    </span>
                                </div>
                            </label>

                            {/* Option 2: Restart Today (Grace Period) */}
                            {new Date(client.endDate) < new Date() && (
                                <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${startDateMode === 'TODAY' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 dark:bg-blue-900/30 dark:border-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                    <input
                                        type="radio"
                                        name="startDateMode"
                                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                        checked={startDateMode === 'TODAY'}
                                        onChange={() => setStartDateMode('TODAY')}
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900 dark:text-white">Empezar Hoy ({new Date().toLocaleDateString()})</span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            Regala los días vencidos. El nuevo periodo cuenta desde hoy.
                                        </span>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodo de Renovación</label>
                        <select
                            value={billingPeriod}
                            onChange={(e) => setBillingPeriod(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            <option value="MONTH">Mensual (1 Mes)</option>
                            <option value="TWO_WEEKS">Quincenal (15 Días)</option>
                            <option value="WEEK">Semanal (7 Días)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Pagar</label>
                        <CurrencyInput
                            value={renewAmount}
                            onValueChange={setRenewAmount}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-700 transition-colors"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Actual: {formatCurrency(Number(client.monthlyRate))} ({client.billingPeriod === 'TWO_WEEKS' ? 'Quincenal' : client.billingPeriod === 'WEEK' ? 'Semanal' : 'Mensual'})
                        </p>
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
