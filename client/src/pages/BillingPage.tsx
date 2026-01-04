import { useState } from 'react';
import { useBilling } from '../hooks/useBilling';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Simple currency formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function BillingPage() {
    const { subscription, plans, invoices, loading, error, changePlan } = useBilling();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información de facturación...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    if (!subscription || !plans) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No se encontró información de suscripción</p>
                </div>
            </div>
        );
    }

    const currentPlan = plans[subscription.plan];
    const isTrialing = subscription.status === 'trialing';
    const trialEndsAt = subscription.trialEnd ? new Date(subscription.trialEnd) : null;
    const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const handleUpgrade = async () => {
        if (!selectedPlan) return;

        try {
            await changePlan(selectedPlan);
            setShowUpgradeModal(false);
            setSelectedPlan(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Facturación y Suscripción
                </h1>
                <p className="text-gray-600">
                    Administra tu plan, facturas y pagos
                </p>
            </div>

            {/* Trial Banner */}
            {isTrialing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">
                                🎉 Período de Prueba Activo
                            </h3>
                            <p className="text-blue-700">
                                Te quedan <strong>{daysRemaining} días</strong> de prueba gratuita
                            </p>
                        </div>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                        >
                            Actualizar Plan
                        </button>
                    </div>
                </div>
            )}

            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-bold text-gray-900">
                        Plan Actual
                    </h2>
                    {!isTrialing && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="text-brand-blue hover:underline font-semibold"
                        >
                            Cambiar Plan
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <h3 className="text-2xl font-bold text-brand-blue">
                                {currentPlan.name}
                            </h3>
                            {currentPlan.price > 0 && (
                                <span className="text-gray-600">
                                    {formatCurrency(currentPlan.price)}/mes
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            {currentPlan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-gray-700">
                                    <span className="text-brand-green">✓</span>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <span className={`font-semibold ${subscription.status === 'active' ? 'text-brand-green' :
                                subscription.status === 'trialing' ? 'text-blue-600' :
                                    'text-gray-600'
                                }`}>
                                {subscription.status === 'active' ? 'Activo' :
                                    subscription.status === 'trialing' ? 'Prueba' :
                                        subscription.status}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Próxima renovación:</span>
                            <span className="font-semibold">
                                {format(new Date(subscription.currentPeriodEnd), 'dd MMM yyyy', { locale: es })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Soporte:</span>
                            <span className="font-semibold">{currentPlan.support}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
                    Facturas
                </h2>

                {invoices.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                        No hay facturas disponibles
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Número
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Fecha
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Monto
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-mono">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {format(new Date(invoice.createdAt), 'dd MMM yyyy', { locale: es })}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold">
                                            {formatCurrency(invoice.total)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {invoice.status === 'paid' ? 'Pagada' :
                                                    invoice.status === 'open' ? 'Pendiente' :
                                                        invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <button className="text-brand-blue hover:underline">
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-display font-bold text-gray-900">
                                Selecciona un Plan
                            </h2>
                        </div>

                        <div className="p-6 grid md:grid-cols-3 gap-4">
                            {Object.entries(plans).filter(([key]) => key !== 'trial').map(([key, plan]) => (
                                <div
                                    key={key}
                                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === key
                                        ? 'border-brand-blue bg-blue-50'
                                        : 'border-gray-200 hover:border-brand-blue'
                                        }`}
                                    onClick={() => setSelectedPlan(key)}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="text-3xl font-bold text-brand-blue mb-4">
                                        {plan.price > 0 ? (
                                            <>
                                                {formatCurrency(plan.price)}
                                                <span className="text-sm text-gray-600">/mes</span>
                                            </>
                                        ) : (
                                            'Contactar'
                                        )}
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-brand-green mt-1">✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowUpgradeModal(false);
                                    setSelectedPlan(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpgrade}
                                disabled={!selectedPlan}
                                className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Actualizar Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
