import React from 'react';
import type { Tenant } from '../../../hooks/useLocationsPage';

interface LocationFilterProps {
    selectedTenant: string;
    setSelectedTenant: (tenantId: string) => void;
    tenants: Tenant[];
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
    selectedTenant,
    setSelectedTenant,
    tenants
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por Empresa
            </label>
            <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Todas las empresas</option>
                {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>
    );
};
