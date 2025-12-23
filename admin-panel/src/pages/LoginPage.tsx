import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Note: Email is not used in backend auth yet, just password
            const { data } = await api.post('/admin/login', { password });
            login(data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales inválidas');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    ParkingSof Admin
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Acceso restringido a administradores
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-950 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-zinc-800">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Correo Electrónico
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white py-2"
                                    placeholder="admin@parkingsof.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-white py-2"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
