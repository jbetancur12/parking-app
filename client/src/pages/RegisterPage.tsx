import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Building, Mail, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-blue p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-blue-100">
                <div className="mb-6 text-center flex flex-col items-center">
                    <div className="bg-blue-50 p-3 rounded-full mb-4">
                        <Rocket className="h-8 w-8 text-brand-blue" />
                    </div>
                    <img src="/logo_cuadra.png" alt="Cuadra" className="h-8 w-auto mb-2" />
                    <h1 className="text-2xl font-display font-bold text-gray-900">Crear Cuenta</h1>
                    <p className="text-sm text-brand-green font-bold mt-1 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        ¡Prueba gratis de 14 días!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Parqueadero</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Building size={18} />
                            </span>
                            <input
                                name="companyName"
                                type="text"
                                required
                                value={formData.companyName}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Ej: Parking Centro"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario Administrador</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <User size={18} />
                            </span>
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Ej: admin_parking"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Mail size={18} />
                            </span>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="contacto@parking.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="******"
                                />
                            </div>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-brand-yellow py-3 text-brand-blue font-bold shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-500 mt-6 transform transition-transform active:scale-95"
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarme y Comenzar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">¿Ya tienes cuenta? </span>
                    <Link to="/login" className="font-bold text-brand-blue hover:text-blue-700 underline decoration-2 decoration-transparent hover:decoration-brand-blue transition-all">
                        Inicia Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
