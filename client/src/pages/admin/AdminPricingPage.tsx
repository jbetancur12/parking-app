import { useState } from 'react';
import { useAdminPricing } from '../../hooks/useAdminPricing';
import type { PricingPlan } from '../../services/pricingPlan.service';
import { Edit, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';

// Simple currency formatter
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AdminPricingPage() {
    const { plans, loading, error, updatePlan, toggleStatus } = useAdminPricing();
    const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
    const [formData, setFormData] = useState<Partial<PricingPlan>>({});

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando planes...</p>
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

    const handleEdit = (plan: PricingPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            maxLocations: plan.maxLocations,
            maxUsers: plan.maxUsers,
            maxSessions: plan.maxSessions,
            features: [...plan.features],
            support: plan.support,
            softLimitPercentage: plan.softLimitPercentage,
            hardLimitPercentage: plan.hardLimitPercentage,
            displayOrder: plan.displayOrder,
        });
    };

    const handleSave = async () => {
        if (!editingPlan) return;

        try {
            await updatePlan(editingPlan.code, formData);
            setEditingPlan(null);
            setFormData({});
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleStatus = async (plan: PricingPlan) => {
        try {
            await toggleStatus(plan.code, !plan.isActive);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...(prev.features || []), '']
        }));
    };

    const updateFeature = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).map((f, i) => i === index ? value : f)
        }));
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Gestión de Planes
                </h1>
                <p className="text-gray-600">
                    Configura precios, límites y features de los planes de suscripción
                </p>
            </div>

            {/* Plans Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Plan
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Límites
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Features
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-semibold text-gray-900">{plan.name}</div>
                                        <div className="text-xs text-gray-500 uppercase">{plan.code}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">
                                        {plan.price > 0 ? `${formatCurrency(plan.price)}/mes` : 'Gratis'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div>Sedes: {plan.maxLocations === -1 ? '∞' : plan.maxLocations}</div>
                                    <div>Usuarios: {plan.maxUsers === -1 ? '∞' : plan.maxUsers}</div>
                                    <div>Sesiones: {plan.maxSessions === -1 ? '∞' : plan.maxSessions.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-600">
                                        {plan.features.length} features
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {plan.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(plan)}
                                            className={`p-2 rounded-lg transition-colors ${plan.isActive
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-green-600 hover:bg-green-50'
                                                }`}
                                            title={plan.isActive ? 'Desactivar' : 'Activar'}
                                        >
                                            {plan.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-display font-bold text-gray-900">
                                Editar Plan: {editingPlan.name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Código: <span className="font-mono">{editingPlan.code}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre del Plan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Precio Mensual ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price || 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        min="0"
                                        step="1"
                                    />
                                </div>
                            </div>

                            {/* Limits */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Límites</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Max Sedes (-1 = ilimitado)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxLocations ?? 0}
                                            onChange={(e) => setFormData(prev => ({ ...prev, maxLocations: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Max Usuarios (-1 = ilimitado)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxUsers ?? 0}
                                            onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Max Sesiones/mes (-1 = ilimitado)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxSessions ?? 0}
                                            onChange={(e) => setFormData(prev => ({ ...prev, maxSessions: parseInt(e.target.value) }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Support */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nivel de Soporte
                                </label>
                                <select
                                    value={formData.support || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, support: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                >
                                    <option value="Email">Email</option>
                                    <option value="Priority">Priority</option>
                                    <option value="24/7">24/7</option>
                                </select>
                            </div>

                            {/* Tolerances */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tolerancias de Uso</h3>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800 mb-2">
                                        <strong>Soft Limit (Advertencia):</strong> Porcentaje del límite donde se muestra advertencia
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        <strong>Hard Limit (Bloqueo):</strong> Porcentaje del límite donde se bloquea el servicio
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Soft Limit (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={(formData.softLimitPercentage ?? 0.8) * 100}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                softLimitPercentage: parseFloat(e.target.value) / 100
                                            }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            min="0"
                                            max="100"
                                            step="5"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ej: 80% = advertencia al llegar al 80% del límite
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hard Limit (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={(formData.hardLimitPercentage ?? 1.2) * 100}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                hardLimitPercentage: parseFloat(e.target.value) / 100
                                            }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            min="100"
                                            max="200"
                                            step="5"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ej: 120% = bloqueo al llegar al 120% del límite
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        💡 <strong>Ejemplo:</strong> Plan con 1,000 sesiones/mes, Soft=80%, Hard=120%
                                        <br />
                                        • 0-800 sesiones: ✅ Normal
                                        <br />
                                        • 801-1,000 sesiones: ⚠️ Advertencia suave
                                        <br />
                                        • 1,001-1,200 sesiones: ⚠️ Advertencia crítica (tolerancia)
                                        <br />
                                        • 1,201+ sesiones: 🚫 Bloqueado
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                                    <button
                                        onClick={addFeature}
                                        className="flex items-center gap-2 px-3 py-1 text-sm bg-brand-blue text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus size={16} />
                                        Agregar
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(formData.features || []).map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                                placeholder="Descripción del feature"
                                            />
                                            <button
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Display Order */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Orden de Visualización
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder ?? 0}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Menor número aparece primero
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setEditingPlan(null);
                                    setFormData({});
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg font-semibold hover:bg-yellow-400"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
