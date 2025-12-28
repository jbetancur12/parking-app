import { useState, useEffect } from 'react';
import { brandService, type Brand } from '../services/brand.service';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BrandsPage() {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check permissions
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN' && user?.role !== 'LOCATION_MANAGER') {
        return (
            <div className="p-8">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    No tienes permisos para acceder a esta página.
                </div>
            </div>
        );
    }

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            const data = await brandService.getAll();
            setBrands(data);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await brandService.create(name.trim());
            setName('');
            loadBrands();
        } catch (error) {
            alert('Error al crear marca');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro?')) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await brandService.delete(id);
            loadBrands();
        } catch (error) {
            alert('Error al eliminar marca');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Tag className="mr-2" /> Marcas de Vehículos
            </h1>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="mb-8 flex gap-4 max-w-md">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 border rounded px-4 py-2"
                    placeholder="Nombre de Nueva Marca (e.j. BMW)"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Plus size={20} className="mr-2" />
                    {isSubmitting ? '...' : 'Agregar'}
                </button>
            </form>

            {/* List */}
            {loading ? (
                <p>Cargando...</p>
            ) : brands.length === 0 ? (
                <p className="text-gray-500">No hay marcas configuradas.</p>
            ) : (
                <div className="bg-white rounded-lg shadow max-w-2xl">
                    <ul className="divide-y">
                        {brands.map(brand => (
                            <li key={brand.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <span className="font-medium text-gray-700">{brand.name}</span>
                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
