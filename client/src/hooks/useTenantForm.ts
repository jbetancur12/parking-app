import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

export interface TenantFormData {
    name: string;
    slug: string;
    contactEmail: string;
    plan: 'basic' | 'pro' | 'enterprise';
}

export const useTenantForm = () => {
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

    return {
        formData,
        loading,
        isEdit,
        handleChange,
        handleSubmit,
        navigate
    };
};
