
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        Asignar Sedes: {assigningUser.username}
                    </h2>
                    <button onClick={onCancel}><X size={20} /></button>
                </div>

                <div className="mb-4 max-h-60 overflow-y-auto border rounded-md">
                    {locations.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">No hay sedes disponibles.</p>
                    ) : (
                        locations.map(loc => (
                            <div key={loc.id} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0">
                                <input
                                    type="checkbox"
                                    id={`loc-${loc.id}`}
                                    checked={selectedLocationIds.includes(loc.id)}
                                    onChange={() => onToggleSelection(loc.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`loc-${loc.id}`} className="ml-3 block text-sm text-gray-700 cursor-pointer flex-1">
                                    {loc.name}
                                </label>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Asignaciones'}
                    </button>
                </div>
            </div>
        </div>
    );
};
