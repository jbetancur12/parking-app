import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TenantFormData {
    name: string;
    slug: string;
    contactEmail: string;
    plan: 'basic' | 'pro' | 'enterprise';
}

export default function TenantFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TenantFormData>({
        name: '',
        slug: '',
        contactEmail: '',
        plan: 'basic',
    });

    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchTenant();
        }
    }, [id]);

    const fetchTenant = async () => {
        try {
            const response = await api.get(`/admin/tenants/${id}`);
            setFormData({
                name: response.data.name,
                slug: response.data.slug,
                contactEmail: response.data.contactEmail || '',
                plan: response.data.plan,
            });
        } catch (error) {
            console.error('Error fetching tenant:', error);
            toast.error('Error al cargar empresa');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Auto-generate slug from name if creating new
        if (name === 'name' && !isEdit) {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/admin/tenants/${id}`, formData);
                toast.success('Empresa actualizada');
            } else {
                await api.post('/admin/tenants', formData);
                toast.success('Empresa creada');
            }
            navigate('/admin/tenants');
        } catch (error: any) {
            console.error('Error saving tenant:', error);
            const message = error.response?.data?.message || 'Error al guardar empresa';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/tenants')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEdit ? 'Actualizar información de la empresa' : 'Crear un nuevo tenant en el sistema'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Empresa *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Parqueadero Don Pepe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug (URL) *
                        </label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">
                                @
                            </span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                pattern="[a-z0-9-]+"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="donpepe"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Solo minúsculas, números y guiones. Ej: parqueadero-centro
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email de Contacto
                        </label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@donpepe.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plan *
                        </label>
                        <select
                            name="plan"
                            value={formData.plan}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="basic">Básico - $50.000/mes</option>
                            <option value="pro">Pro - Profesional</option>
                            <option value="enterprise">Enterprise - Empresarial</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Empresa'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/tenants')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
