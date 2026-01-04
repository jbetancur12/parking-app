import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { usePricingPlans } from '../../../hooks/usePricingPlans';

interface PlansInfoModalProps {
    show: boolean;
    onClose: () => void;
}

export const PlansInfoModal: React.FC<PlansInfoModalProps> = ({ show, onClose }) => {
    const { plans, loading } = usePricingPlans();

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-brand-blue dark:text-blue-300">Estructura de Planes SaaS</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold"
                    >
                        X
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Cargando planes...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.slug}
                                className={`border rounded-xl p-6 transition-colors ${plan.slug === 'pro'
                                        ? 'border-brand-blue dark:border-blue-500 ring-1 ring-brand-blue dark:ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                                        : 'border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                <h3 className="text-xl font-bold text-brand-blue dark:text-blue-300 mb-2 uppercase">{plan.name}</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    ${plan.price.toLocaleString()} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/mes</span>
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                                        <MapPin className="h-5 w-5 text-brand-green dark:text-green-400 mr-2" />
                                        <span className="font-bold">{plan.maxLocations === -1 ? '∞' : plan.maxLocations}</span> &nbsp; Sedes Máximas
                                    </li>
                                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                                        <Users className="h-5 w-5 text-brand-green dark:text-green-400 mr-2" />
                                        <span className="font-bold">{plan.maxUsers === -1 ? '∞' : plan.maxUsers}</span> &nbsp; Usuarios Admin/Op
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
