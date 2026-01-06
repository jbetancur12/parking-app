import React from 'react';
import { X, CheckCircle, MapPin, Users } from 'lucide-react';
import { usePricingPlans } from '../../../hooks/usePricingPlans';

interface UpdatePlanModalProps {
    selectedPlan: string;
    setSelectedPlan: (plan: string) => void;
    currentPlan: string;
    handleUpdatePlan: () => void;
    setShowPlanModal: (show: boolean) => void;
}

export const UpdatePlanModal: React.FC<UpdatePlanModalProps> = ({
    selectedPlan,
    setSelectedPlan,
    currentPlan,
    handleUpdatePlan,
    setShowPlanModal
}) => {
    const { plans, loading } = usePricingPlans();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Cargando planes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-display font-bold text-brand-blue dark:text-blue-300">Cambiar Plan de Suscripción</h3>
                    <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 scale-110">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.code}
                            className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${selectedPlan === plan.code
                                ? 'border-brand-blue dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-brand-blue dark:ring-blue-400 ring-opacity-20 transform scale-105 shadow-lg'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                                }`}
                            onClick={() => setSelectedPlan(plan.code)}
                        >
                            {selectedPlan === plan.code && (
                                <div className="absolute top-3 right-3 text-brand-blue dark:text-blue-400">
                                    <CheckCircle className="h-6 w-6 fill-current" />
                                </div>
                            )}
                            <h4 className="text-xl font-bold text-brand-blue dark:text-blue-300 mb-2 uppercase">{plan.name}</h4>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                ${plan.price.toLocaleString()} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/mes</span>
                            </p>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                    <MapPin className="h-4 w-4 text-brand-green dark:text-green-400 mr-2" />
                                    <span className="font-bold">{plan.maxLocations === -1 ? '∞' : plan.maxLocations}</span> &nbsp; Sedes Máximas
                                </li>
                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                    <Users className="h-4 w-4 text-brand-green dark:text-green-400 mr-2" />
                                    <span className="font-bold">{plan.maxUsers === -1 ? '∞' : plan.maxUsers}</span> &nbsp; Usuarios Admin/Op
                                </li>
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setShowPlanModal(false)}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpdatePlan}
                        className="px-6 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md transition-colors"
                        disabled={selectedPlan === currentPlan}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};
