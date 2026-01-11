import React, { useState, useEffect } from 'react';
import { CurrencyInput } from '../common/CurrencyInput';
import { tariffService, type Tariff } from '../../services/tariff.service';
import { X, AlertTriangle } from 'lucide-react';

interface MonthlyClientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export const MonthlyClientForm: React.FC<MonthlyClientFormProps> = ({ isOpen, onClose, onSubmit }) => {
    const [plate, setPlate] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [monthlyRate, setMonthlyRate] = useState('0');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [billingPeriod, setBillingPeriod] = useState('MONTH');
    const [tariffs, setTariffs] = useState<Tariff[]>([]);

    useEffect(() => {
        if (isOpen) {
            tariffService.getAll().then(setTariffs).catch(console.error);
        }
    }, [isOpen]);

    useEffect(() => {
        const t = tariffs.find(t => t.vehicleType === vehicleType && t.tariffType === billingPeriod);
        if (t) setMonthlyRate(t.cost.toString());
    }, [vehicleType, billingPeriod, tariffs]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit({
                plate: plate.toUpperCase(),
                name,
                phone,
                vehicleType,
                paymentMethod,
                monthlyRate: Number(monthlyRate),
                startDate, // Pass startDate
                billingPeriod
            });
            // Reset form on success (the parent might toggle isOpen, but we should clear state)
            setPlate('');
            setName('');
            setPhone('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setBillingPeriod('MONTH');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl animate-fade-in-up border dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nuevo Cliente Mensual</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X size={20} /></button>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center"><AlertTriangle size={16} className="mr-2" />{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Placa</label>
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^[0-9+\-() ]*$/.test(val)) {
                                    setPhone(val);
                                }
                            }}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="+57 300 123 4567"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Periodo</label>
                            <select
                                value={billingPeriod}
                                onChange={(e) => setBillingPeriod(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="MONTH">Mensual</option>
                                <option value="TWO_WEEKS">Quincenal (15 días)</option>
                                <option value="WEEK">Semanal (7 días)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Vehículo</label>
                            <select
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="CAR">Carro</option>
                                <option value="MOTORCYCLE">Moto</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tarifa ({billingPeriod === 'MONTH' ? 'Mensual' : billingPeriod === 'TWO_WEEKS' ? 'Quincenal' : 'Semanal'})</label>
                            <CurrencyInput
                                value={monthlyRate}
                                onValueChange={setMonthlyRate}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medio de Pago</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="CASH">Efectivo</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="CARD">Tarjeta</option>
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-brand-yellow text-brand-blue py-3 rounded-lg hover:bg-yellow-400 font-bold shadow-md transition-transform active:scale-95 mt-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Registrando...' : 'Crear Cliente'}
                    </button>
                </form>
            </div >
        </div >
    );
};
