import { useState } from 'react';
import { useAdminBilling } from '../../hooks/useAdminBilling';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';
import api from '../../services/api';

// Simple currency formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AdminBillingPage() {
    const { subscriptions, invoices, payments, stats, loading, error, recordPayment } = useAdminBilling();
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'payments'>('subscriptions');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMethod: 'transfer' as 'card' | 'transfer' | 'cash' | 'other',
        notes: '',
        transactionId: '',
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos de facturación...</p>
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

    const handleRecordPayment = async () => {
        if (!selectedInvoice || !paymentForm.amount) return;

        try {
            await recordPayment({
                invoiceId: selectedInvoice,
                amount: parseFloat(paymentForm.amount),
                paymentMethod: paymentForm.paymentMethod,
                notes: paymentForm.notes || undefined,
                transactionId: paymentForm.transactionId || undefined,
            });

            // Reset form
            setShowPaymentModal(false);
            setSelectedInvoice(null);
            setPaymentForm({
                amount: '',
                paymentMethod: 'transfer',
                notes: '',
                transactionId: '',
            });
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                            Admin - Facturación
                        </h1>
                        <p className="text-gray-600">
                            Gestiona suscripciones, facturas y pagos de todos los tenants
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            if (confirm('¿Verificar suscripciones vencidas y generar facturas?')) {
                                try {
                                    const response = await api.post('/admin/billing/subscriptions/check-expired');
                                    alert(`✅ Verificación completada:\n- Revisadas: ${response.data.checked}\n- Vencidas: ${response.data.expired}\n- Facturas generadas: ${response.data.invoicesGenerated}`);
                                    window.location.reload();
                                } catch (err: any) {
                                    alert('Error: ' + (err.response?.data?.message || err.message));
                                }
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Verificar Suscripciones
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600">Revenue Total</h3>
                            <DollarSign className="text-brand-green" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600">MRR (Este Mes)</h3>
                            <TrendingUp className="text-brand-blue" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(stats.monthlyRevenue)}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600">Pendiente</h3>
                            <FileText className="text-yellow-600" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(stats.pendingAmount)}
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-4 px-6">
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'subscriptions'
                                ? 'border-brand-blue text-brand-blue'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Suscripciones ({subscriptions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'invoices'
                                ? 'border-brand-blue text-brand-blue'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Facturas ({invoices.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-4 px-2 border-b-2 font-semibold transition-colors ${activeTab === 'payments'
                                ? 'border-brand-blue text-brand-blue'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Pagos ({payments.length})
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Tenant
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Plan
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Monto
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Próxima Renovación
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">
                                                <div>
                                                    <div className="font-semibold">{sub.tenant.name}</div>
                                                    <div className="text-gray-500 text-xs">{sub.tenant.slug}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold uppercase">
                                                {sub.plan}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    sub.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {sub.status === 'active' ? 'Activo' :
                                                        sub.status === 'trialing' ? 'Trial' :
                                                            sub.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold">
                                                {formatCurrency(sub.amount)}/mes
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy', { locale: es })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Número
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Tenant
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
                                            <td className="px-4 py-3 text-sm font-semibold">
                                                {invoice.tenant.name}
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
                                                {invoice.status === 'open' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInvoice(invoice.id);
                                                            setPaymentForm(prev => ({
                                                                ...prev,
                                                                amount: invoice.total.toString()
                                                            }));
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="text-brand-blue hover:underline font-semibold"
                                                    >
                                                        Registrar Pago
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Tenant
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Factura
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Monto
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Método
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">
                                                {format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold">
                                                {payment.tenant.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono">
                                                {payment.invoice.invoiceNumber}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm capitalize">
                                                {payment.paymentMethod === 'transfer' ? 'Transferencia' :
                                                    payment.paymentMethod === 'card' ? 'Tarjeta' :
                                                        payment.paymentMethod === 'cash' ? 'Efectivo' :
                                                            payment.paymentMethod}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {payment.status === 'completed' ? 'Completado' :
                                                        payment.status === 'pending' ? 'Pendiente' :
                                                            payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-display font-bold text-gray-900">
                                Registrar Pago
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Monto
                                </label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Método de Pago
                                </label>
                                <select
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                >
                                    <option value="transfer">Transferencia</option>
                                    <option value="card">Tarjeta</option>
                                    <option value="cash">Efectivo</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ID de Transacción (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.transactionId}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                    placeholder="TXN-123456"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                    rows={3}
                                    placeholder="Información adicional..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedInvoice(null);
                                    setPaymentForm({
                                        amount: '',
                                        paymentMethod: 'transfer',
                                        notes: '',
                                        transactionId: '',
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRecordPayment}
                                disabled={!paymentForm.amount}
                                className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Registrar Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
