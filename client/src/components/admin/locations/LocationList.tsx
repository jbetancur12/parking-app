import React from 'react';
import { MapPin, Building2, Edit, Trash2, RotateCcw } from 'lucide-react';
import type { Location } from '../../../hooks/useLocationsPage';

interface LocationListProps {
    locations: Location[];
    loading: boolean;
    handleEdit: (location: Location) => void;
    handleDelete: (id: string) => void;
    handleReactivate: (location: Location) => void;
}

export const LocationList: React.FC<LocationListProps> = ({
    locations,
    loading,
    handleEdit,
    handleDelete,
    handleReactivate
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
            {loading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando...</div>
            ) : locations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">No hay sedes registradas</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Sede
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Dirección
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Teléfono
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {locations.map((location) => (
                            <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{location.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                                        <Building2 className="mr-1 h-4 w-4 text-gray-400" />
                                        {location.tenant.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {location.address || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {location.phone || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${location.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                        }`}>
                                        {location.isActive ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(location)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        {location.isActive ? (
                                            <button
                                                onClick={() => handleDelete(location.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                title="Desactivar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReactivate(location)}
                                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                title="Reactivar"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
