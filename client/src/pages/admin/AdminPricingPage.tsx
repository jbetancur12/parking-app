import { useState } from 'react';
import { useAdminPricing } from '../../hooks/useAdminPricing';
import type { PricingPlan } from '../../services/pricingPlan.service';
import { Edit, ToggleLeft, ToggleRight, Plus, Trash2, Copy } from 'lucide-react';
import FeatureManagerModal from '../../components/admin/features/FeatureManagerModal';
import { type FeatureDefinition } from '../../services/featureDefinition.service';
import { useEffect } from 'react';

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
    const { plans, loading, error, createPlan, updatePlan, toggleStatus } = useAdminPricing();
    const [editingPlan, setEditingPlan] = useState<Partial<PricingPlan> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<PricingPlan>>({});
    const [showFeatureManager, setShowFeatureManager] = useState(false);
    const [knownFeatures, setKnownFeatures] = useState<FeatureDefinition[]>([]);

    useEffect(() => {
        if (editingPlan || isCreating) {
            import('../../services/featureDefinition.service').then(({ getFeatures }) => {
                getFeatures().then(setKnownFeatures).catch(console.error);
            });
        }
    }, [editingPlan, isCreating]);

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

    const handleCreate = () => {
        setIsCreating(true);
        setEditingPlan({});
        setFormData({
            code: '',
            name: '',
            price: 0,
            maxLocations: 1,
            maxUsers: 1,
            maxSessions: 1000,
            features: [],
            featureFlags: {},
            support: 'Email',
            softLimitPercentage: 0.8,
            hardLimitPercentage: 1.2,
            isPublic: false, // Default to hidden for custom plans
            displayOrder: 0,
            isActive: true
        });
    };

    const handleClone = (plan: PricingPlan) => {
        setIsCreating(true);
        setEditingPlan(plan); // Keep ref to original if needed, or just allow edit
        setFormData({
            ...plan,
            code: `${plan.code}_copy`,
            name: `${plan.name} (Copia)`,
            isPublic: false, // Clone as hidden by default
        });
    };

    const handleEdit = (plan: PricingPlan) => {
        setIsCreating(false);
        setEditingPlan(plan);
        setFormData({
            ...plan
        });
    };

    const handleSave = async () => {
        try {
            if (isCreating) {
                if (!formData.code || !formData.name) {
                    alert('Código y Nombre son requeridos');
                    return;
                }
                await createPlan(formData);
            } else {
                if (editingPlan && editingPlan.code) {
                    await updatePlan(editingPlan.code, formData);
                }
            }
            setEditingPlan(null);
            setIsCreating(false);
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Gestión de Planes
                    </h1>
                    <p className="text-gray-600">
                        Configura precios, límites y features de los planes de suscripción
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors py-2 px-4"
                >
                    <Plus size={20} />
                    Crear Nuevo Plan
                </button>
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
                                            onClick={() => handleClone(plan)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Clonar como nuevo plan"
                                        >
                                            <Copy size={18} />
                                        </button>
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
                            {/* Identifiers (Only editable when creating) */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Código del Plan (ID único)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                        disabled={!isCreating}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent ${!isCreating ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300'}`}
                                        placeholder="Ej: enterprise_coca_cola"
                                    />
                                    {isCreating && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Usado internamente. No se puede cambiar después.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Visibilidad
                                    </label>
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 ${formData.isPublic ? 'bg-brand-blue' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className="text-sm text-gray-700">
                                            {formData.isPublic ? 'Público (Visible en Web)' : 'Oculto (Solo Asignación Manual)'}
                                        </span>
                                    </div>
                                </div>
                            </div>

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





                            {/* Feature Flags Editor */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Feature Flags (Toggles)</h3>
                                    <button
                                        onClick={() => setShowFeatureManager(true)}
                                        className="text-xs text-purple-600 hover:text-purple-800 underline font-medium"
                                    >
                                        Administrar Banco de Features
                                    </button>
                                </div>

                                {/* Add New Flag Section */}
                                <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-100">
                                    <label className="block text-xs font-semibold text-purple-800 mb-2 uppercase tracking-wide">
                                        Agregar Nuevo Flag
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                list="known-flags"
                                                type="text"
                                                id="new-flag-input"
                                                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Ej: can_export_reports"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value.trim();
                                                        if (val) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                featureFlags: { ...(prev.featureFlags || {}), [val]: true }
                                                            }));
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <datalist id="known-flags">
                                                {knownFeatures.map(f => (
                                                    <option key={f.key} value={f.key}>{f.description}</option>
                                                ))}
                                                {/* Fallback for flags used in other plans but not in bank */}
                                                {plans.flatMap(p => Object.keys(p.featureFlags || {}))
                                                    .filter(k => !knownFeatures.find(kf => kf.key === k))
                                                    .filter((v, i, a) => a.indexOf(v) === i)
                                                    .map(flag => (
                                                        <option key={flag} value={flag} />
                                                    ))}
                                            </datalist>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('new-flag-input') as HTMLInputElement;
                                                const val = input.value.trim();
                                                if (val) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        featureFlags: { ...(prev.featureFlags || {}), [val]: true }
                                                    }));
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Agregar
                                        </button>
                                    </div>
                                    <p className="text-xs text-purple-600 mt-2">
                                        💡 Escribe o selecciona un flag de la lista. Se guardará en el "Banco" automáticamente al usarlo.
                                    </p>
                                </div>

                                {/* Active Flags List */}
                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                        Flags Activos en este Plan
                                    </label>
                                    {Object.entries(formData.featureFlags || {}).map(([key, value], index) => (
                                        <div key={index} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200 shadow-sm">
                                            <div className="flex-1 font-mono text-sm text-gray-700 font-medium">
                                                {key}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        featureFlags: { ...prev.featureFlags, [key]: !value }
                                                    }))}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${value
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                        }`}
                                                >
                                                    {value ? 'ON' : 'OFF'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newFlags = { ...(formData.featureFlags || {}) };
                                                        delete newFlags[key];
                                                        setFormData(prev => ({ ...prev, featureFlags: newFlags }));
                                                    }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                                                    title="Eliminar del plan"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(formData.featureFlags || {}).length === 0 && (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-400 italic">No hay flags activos para este plan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Features (Existing) */}
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

            {showFeatureManager && (
                <FeatureManagerModal onClose={() => {
                    setShowFeatureManager(false);
                    // Refresh known features on close
                    import('../../services/featureDefinition.service').then(({ getFeatures }) => {
                        getFeatures().then(setKnownFeatures).catch(console.error);
                    });
                }} />
            )}
        </div>
    );
}
