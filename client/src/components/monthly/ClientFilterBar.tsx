import React from 'react';
import { Search } from 'lucide-react';
import { type FilterStatus } from '../../hooks/useMonthlyClients';

interface ClientFilterBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filterStatus: FilterStatus;
    onFilterChange: (status: FilterStatus) => void;
}

export const ClientFilterBar: React.FC<ClientFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange
}) => {
    const filters: { label: string; value: FilterStatus; color: string }[] = [
        { label: 'Todos', value: 'ALL', color: 'bg-brand-blue text-white shadow-sm' },
        { label: 'Activos', value: 'ACTIVE', color: 'bg-brand-green text-white shadow-sm' },
        { label: 'Vencidos', value: 'EXPIRED', color: 'bg-red-500 text-white shadow-sm' }
    ];

    return (
        <div>
            {/* Filter Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex-1 md:flex-none ${filterStatus === filter.value
                            ? filter.color
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o placa (incluso desactivados)..."
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow uppercase bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
                />
            </div>
        </div>
    );
};
