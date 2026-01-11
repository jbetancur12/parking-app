
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const isActivation = searchParams.get('is_activation') === 'true';

    // State for Forgot Password (Request Link)
    const [email, setEmail] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    // State for Reset Password (Set New)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRequestLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Using API URL from environment similar to other components
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            await axios.post(`${apiUrl}/auth/forgot-password`, { email });
            setRequestSent(true);
            toast.success('Enlace enviado. Revisa tu correo.');
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            await axios.post(`${apiUrl}/auth/reset-password`, { token, password });
            toast.success('Contraseña actualizada correctamente');
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error('Token inválido o expirado.');
        } finally {
            setLoading(false);
        }
    };

    // VIEW: REQUEST RESET LINK
    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-blue p-4 bg-[url('/pattern.png')] bg-repeat">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-blue-100">
                    <div className="mb-6 text-center">
                        <img src="/logo_cuadra.png" alt="Cuadra" className="h-20 w-auto mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-brand-blue">Recuperar Contraseña</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Ingresa tu correo para recibir las instrucciones
                        </p>
                    </div>

                    {requestSent ? (
                        <div className="text-center py-4">
                            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">¡Correo Enviado!</h3>
                            <p className="text-gray-600 mt-2 mb-6 text-sm">
                                Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
                            </p>
                            <Link to="/login" className="text-brand-blue font-semibold hover:underline">
                                Volver al inicio
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRequestLink} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <Mail size={20} />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 pl-10 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="tu-correo@ejemplo.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-brand-yellow py-3 px-4 text-brand-blue font-bold shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all"
                            >
                                {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                            </button>

                            <div className="text-center">
                                <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-blue transition-colors">
                                    <ArrowLeft size={16} className="mr-1" /> Volver
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // VIEW: SET NEW PASSWORD
    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-blue p-4 bg-[url('/pattern.png')] bg-repeat">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-blue-100">
                <div className="mb-6 text-center">
                    <img src="/logo_cuadra.png" alt="Cuadra" className="h-20 w-auto mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-brand-blue">
                        {isActivation ? 'Activar Cuenta' : 'Nueva Contraseña'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {isActivation ? 'Define tu contraseña segura' : 'Ingresa tu nueva contraseña'}
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-brand-yellow py-3 px-4 text-brand-blue font-bold shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all"
                    >
                        {loading ? 'Guardando...' : (isActivation ? 'Activar Cuenta' : 'Restablecer')}
                    </button>

                    {!isActivation && (
                        <div className="text-center">
                            <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-blue transition-colors">
                                <ArrowLeft size={16} className="mr-1" /> Cancelar
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
