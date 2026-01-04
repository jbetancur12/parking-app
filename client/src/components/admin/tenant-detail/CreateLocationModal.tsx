import React from 'react';

interface CreateLocationModalProps {
    newLocation: any;
    setNewLocation: (location: any) => void;
    createLocation: (e: React.FormEvent) => void;
    setShowAddLocationModal: (show: boolean) => void;
}

export const CreateLocationModal: React.FC<CreateLocationModalProps> = ({
    newLocation,
    setNewLocation,
    createLocation,
    setShowAddLocationModal
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-colors">
                <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300 mb-4">Nueva Sede</h3>
                <form onSubmit={createLocation} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre de la Sede</label>
                        <input
                            type="text"
                            required
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                            placeholder="Ej. Sede Norte"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                        <input
                            type="text"
                            value={newLocation.address}
                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                            placeholder="Ej. Calle 123 #45-67"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={newLocation.phone}
                            onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                            placeholder="Ej. 300 123 4567"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowAddLocationModal(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md"
                        >
                            Crear Sede
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
