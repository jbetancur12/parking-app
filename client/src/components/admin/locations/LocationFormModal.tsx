import React from 'react';
import type { Tenant, Location } from '../../../hooks/useLocationsPage';

interface LocationFormModalProps {
    showForm: boolean;
    editingLocation: Location | null;
    formData: {
        tenantId: string;
        name: string;
        address: string;
        phone: string;
    };
    setFormData: (data: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    resetForm: () => void;
    tenants: Tenant[];
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
    showForm,
    editingLocation,
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    tenants
}) => {
    if (!showForm) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {editingLocation ? 'Editar Sede' : 'Nueva Sede'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Empresa *
                    </label>
                    <select
                        value={formData.tenantId}
                        onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                        required
                        disabled={!!editingLocation}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
                    >
                        <option value="">Seleccionar empresa...</option>
                        {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de la Sede *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Sede Centro"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dirección
                    </label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Calle 123 #45-67"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+57 123 456 7890"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {editingLocation ? 'Actualizar' : 'Crear Sede'}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};
