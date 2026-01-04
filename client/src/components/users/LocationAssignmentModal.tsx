
import React from 'react';
import { X } from 'lucide-react';
import type { User } from '../../hooks/useUsersPage';

interface LocationAssignmentModalProps {
    assigningUser: User;
    locations: any[];
    selectedLocationIds: string[];
    onToggleSelection: (id: string) => void;
    onSave: () => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

export const LocationAssignmentModal: React.FC<LocationAssignmentModalProps> = ({
    assigningUser,
    locations,
    selectedLocationIds,
    onToggleSelection,
    onSave,
    onCancel,
    isSubmitting
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl transition-all border dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Asignar Sedes: {assigningUser.username}
                    </h2>
                    <button onClick={onCancel} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50">
                    {locations.length === 0 ? (
                        <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No hay sedes disponibles.</p>
                    ) : (
                        locations.map(loc => (
                            <div key={loc.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors">
                                <input
                                    type="checkbox"
                                    id={`loc-${loc.id}`}
                                    checked={selectedLocationIds.includes(loc.id)}
                                    onChange={() => onToggleSelection(loc.id)}
                                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                                <label htmlFor={`loc-${loc.id}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                                    {loc.name}
                                </label>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-800 transition-colors font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Asignaciones'}
                    </button>
                </div>
            </div>
        </div>
    );
};
