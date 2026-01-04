import React from 'react';
import type { FilterType } from '../../../hooks/useTenantsPage';

interface TenantFilterProps {
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
}

export const TenantFilter: React.FC<TenantFilterProps> = ({ filter, setFilter }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all'
                    ? 'bg-brand-blue dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                Todas
            </button>
            <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'active'
                    ? 'bg-brand-blue dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                Activas
            </button>
            <button
                onClick={() => setFilter('suspended')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'suspended'
                    ? 'bg-brand-blue dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                Suspendidas
            </button>
        </div>
    );
};
