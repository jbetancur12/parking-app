
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';

export interface Agreement {
    id: number;
    name: string;
    type: 'FREE_HOURS' | 'PERCENTAGE' | 'FLAT_DISCOUNT';
    value: number;
    isActive: boolean;
    description?: string;
}

export const useAgreementsPage = () => {
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<Agreement['type']>('PERCENTAGE');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');

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

    return {
        agreements,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isSubmitting,
        name,
        setName,
        type,
        setType,
        value,
        setValue,
        description,
        setDescription,
        handleCreate,
        handleToggleStatus,
        fetchAgreements
    };
};
