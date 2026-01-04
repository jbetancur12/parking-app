import React, { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';
import { washService, type WashServiceType } from '../../services/wash.service';
import { toast } from 'sonner';

interface WashServicesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const WashServicesModal: React.FC<WashServicesModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const [services, setServices] = useState<WashServiceType[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [vehicleType, setVehicleType] = useState('Carro');

    useEffect(() => {
        if (isOpen) {
            loadServices();
            resetForm();
        }
    }, [isOpen]);

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await washService.getTypes();
            setServices(data);
        } catch (error) {
            toast.error('Error al cargar servicios');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setVehicleType('Carro');
        setEditingId(null);
    };

    const handleEdit = (service: WashServiceType) => {
        setEditingId(service.id);
        setName(service.name);
        setPrice(service.price.toString());
        setVehicleType(service.vehicleType);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Reusing loading state which affects the list, but effectively prevents double input
        try {
            if (editingId) {
                await washService.updateType(editingId, { name, price: Number(price), vehicleType });
                toast.success('Servicio actualizado');
            } else {
                await washService.createType({ name, price: Number(price), vehicleType });
                toast.success('Servicio creado');
            }
            loadServices(); // This will eventually set loading to false via finally block in loadServices?
            // loadServices sets loading(true) then finally(false). 
            // So if I call loadServices here, it will restart the loading cycle, which is fine.
            onUpdate(); // Refresh parent
            resetForm();
        } catch (error) {
            toast.error('Error al guardar servicio');
            setLoading(false); // Only needed if loadServices not called or fails
        }
        // Note: loadServices handles setLoading(false) in its finally block.
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
        setLoading(true);
        try {
            await washService.deleteType(id);
            toast.success('Servicio eliminado');
            loadServices();
            onUpdate();
        } catch (error) {
            toast.error('Error al eliminar servicio');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-gray-700 transition-colors">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-brand-blue text-white">
                    <h2 className="text-lg font-bold">Configurar Servicios de Lavado</h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">
                            {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded p-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:ring-2 focus:ring-brand-blue outline-none"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ej: General Moto"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Precio Sugerido</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border rounded p-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:ring-2 focus:ring-brand-blue outline-none"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder="$"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehículo</label>
                                <select
                                    className="w-full border rounded p-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-brand-blue outline-none"
                                    value={vehicleType}
                                    onChange={e => setVehicleType(e.target.value)}
                                >
                                    <option value="Carro">Carro</option>
                                    <option value="Moto">Moto</option>
                                    <option value="Camioneta">Camioneta</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? '...' : <Plus size={14} className="mr-1" />}
                                {editingId ? 'Actualizar' : 'Agregar'}
                            </button>
                        </div>
                    </form>

                    {/* List */}
                    {loading ? (
                        <div className="text-center py-4 text-gray-400">Cargando...</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Tipo</th>
                                    <th className="px-4 py-2">Precio</th>
                                    <th className="px-4 py-2 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{service.name}</td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{service.vehicleType}</td>
                                        <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">${service.price.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {services.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-gray-400 dark:text-gray-500">
                                            No hay servicios configurados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
