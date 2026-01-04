import React, { useState, useEffect } from 'react';
import { X, Car, Bike, Truck, Clock, Calendar } from 'lucide-react';
import { type Tariff } from '../../services/tariff.service';

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent, data: { plate: string; vehicleType: string; planType: string }) => void;
    tariffs: Tariff[];
    isSubmitting: boolean;
}

export const EntryModal: React.FC<EntryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    tariffs,
    isSubmitting
}) => {
    const [plate, setPlate] = useState('');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [planType, setPlanType] = useState('HOUR');

    useEffect(() => {
        if (isOpen) {
            // Reset logic could go here if needed, but simple re-mount or useEffect dependency handles it
            setPlate('');
            setVehicleType('CAR');
            setPlanType('HOUR');
        }
    }, [isOpen]);

    // Auto-select plan type logic
    useEffect(() => {
        const currentTariff = tariffs.find(t => t.vehicleType === vehicleType);
        // If NOT traditional, force HOUR (Standard) plan
        if (currentTariff && currentTariff.pricingModel !== 'TRADITIONAL') {
            setPlanType('HOUR');
        }
    }, [vehicleType, tariffs]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e, { plate, vehicleType, planType });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl border dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold dark:text-white">Ingreso de Vehículo</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Placa</label>
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 uppercase bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-brand-blue focus:border-brand-blue"
                            placeholder="ABC-123"
                            required
                            name="plate"
                            id="plate"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Vehículo</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { type: 'CAR', icon: Car, label: 'Carro' },
                                { type: 'MOTORCYCLE', icon: Bike, label: 'Moto' },
                                { type: 'OTHER', icon: Truck, label: 'Otro' }
                            ].map(({ type, icon: Icon, label }) => (
                                <button
                                    type="button"
                                    key={type}
                                    data-testid={`btn-type-${type}`}
                                    onClick={() => setVehicleType(type)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${vehicleType === type
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm transform scale-[1.02]'
                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Icon size={28} className="mb-1" />
                                    <span className="text-xs font-bold">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {tariffs.find(t => t.vehicleType === vehicleType)?.pricingModel === 'TRADITIONAL' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan de Facturación</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPlanType('HOUR')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${planType === 'HOUR'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Clock size={24} className="mb-1" />
                                    <span className="text-xs font-bold">Por Hora</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlanType('DAY')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${planType === 'DAY'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:border-purple-200 dark:hover:border-gray-500 hover:bg-purple-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Calendar size={24} className="mb-1" />
                                    <span className="text-xs font-bold">Por Día</span>
                                </button>
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-brand-yellow text-brand-blue font-bold py-3 rounded-lg hover:bg-yellow-400 shadow-md transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="btn-register-entry"
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrar Entrada'}
                    </button>
                </form>
            </div>
        </div>
    );
};
