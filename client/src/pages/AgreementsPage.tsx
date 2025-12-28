import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Power } from 'lucide-react';
import { toast } from 'sonner';

interface Agreement {
    id: number;
    name: string;
    type: 'FREE_HOURS' | 'PERCENTAGE' | 'FLAT_DISCOUNT';
    value: number;
    isActive: boolean;
    description?: string;
}

export default function AgreementsPage() {
    const { user } = useAuth();
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<Agreement['type']>('PERCENTAGE');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');

    // Permission Check
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN' && user?.role !== 'LOCATION_MANAGER') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <Power className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
                <p>No tienes permisos para ver esta página.</p>
            </div>
        );
    }

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        try {
            const response = await api.get('/agreements');
            setAgreements(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar convenios');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.post('/agreements', {
                name,
                type,
                value: Number(value),
                description
            });
            toast.success('Convenio creado exitosamente');
            setIsCreateModalOpen(false);
            resetForm();
            fetchAgreements();
        } catch (error) {
            console.error(error);
            toast.error('Error al crear convenio');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: number) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/agreements/${id}/status`);
            fetchAgreements();
            toast.success('Estado actualizado');
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar estado');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setType('PERCENTAGE');
        setValue('');
        setDescription('');
    };

    const getTypeValueLabel = (type: string, value: number) => {
        switch (type) {
            case 'FREE_HOURS':
                return `${value} Hora(s) Gratis`;
            case 'PERCENTAGE':
                return `${value}% Desc.`;
            case 'FLAT_DISCOUNT':
                return `$${value} Desc.`;
            default:
                return value;
        }
    };

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'LOCATION_MANAGER') {
        return (
            <div className="p-8 text-center text-red-600">
                No tienes permisos para ver esta página.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Briefcase className="mr-2 text-blue-600" /> Gestión de Convenios
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Convenio
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agreements.map((agreement) => (
                            <tr key={agreement.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {agreement.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                    {getTypeValueLabel(agreement.type, agreement.value)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {agreement.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${agreement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {agreement.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleToggleStatus(agreement.id)}
                                        className={`text-sm font-medium ${agreement.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                        title={agreement.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        <Power size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Crear Nuevo Convenio</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="Ej. Restaurante X"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Beneficio</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="PERCENTAGE">Porcentaje de Descuento</option>
                                    <option value="FREE_HOURS">Horas Gratis</option>
                                    <option value="FLAT_DISCOUNT">Descuento Fijo ($)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {type === 'PERCENTAGE' ? 'Porcentaje (%)' : type === 'FREE_HOURS' ? 'Cantidad de Horas' : 'Monto ($)'}
                                </label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="0"
                                    min="0"
                                    step={type === 'PERCENTAGE' ? '1' : '0.01'}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Creando...' : 'Crear Convenio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
