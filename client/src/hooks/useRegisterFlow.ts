import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

export const useRegisterFlow = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                companyName: formData.companyName,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            const { token, user } = response.data;
            login(token, user);
            toast.success('¡Registro exitoso! Bienvenido a tu prueba gratuita.');
            navigate('/');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        handleChange,
        handleSubmit
    };
};
