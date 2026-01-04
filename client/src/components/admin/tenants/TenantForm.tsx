import React from 'react';
import type { TenantFormData } from '../../../hooks/useTenantForm';

interface TenantFormProps {
    formData: TenantFormData;
    loading: boolean;
    isEdit: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export const TenantForm: React.FC<TenantFormProps> = ({
    formData,
    loading,
    isEdit,
    handleChange,
    handleSubmit,
    onCancel
}) => {
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Empresa *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="Ej: Parqueadero Don Pepe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL) *
                </label>
                <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-sm text-gray-600 dark:text-gray-400">
                        @
                    </span>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        pattern="[a-z0-9-]+"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        placeholder="donpepe"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Solo minúsculas, números y guiones. Ej: parqueadero-centro
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de Contacto
                </label>
                <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="admin@donpepe.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan *
                </label>
                <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                    <option value="basic">Básico - $50.000/mes</option>
                    <option value="pro">Pro - Profesional</option>
                    <option value="enterprise">Enterprise - Empresarial</option>
                </select>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Empresa'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};
