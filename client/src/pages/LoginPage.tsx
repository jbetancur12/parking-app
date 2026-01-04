import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { useLoginFlow } from '../hooks/useLoginFlow';

export default function LoginPage() {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        handleLogin
    } = useLoginFlow();

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-blue p-4 bg-[url('/pattern.png')] bg-repeat">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-blue-100">
                <div className="mb-8 text-center flex flex-col items-center">
                    <img src="/logo_cuadra.png" alt="Cuadra" className="h-24 w-auto mb-6" />
                    <p className="text-gray-500 font-sans">Inicie sesión para continuar</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center">
                        <span className="font-bold mr-2">Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <User size={20} />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 pl-10 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                placeholder="Nombre de usuario"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
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
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-brand-yellow py-3 px-4 text-brand-blue font-bold shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Ingresar
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600">¿No tienes cuenta? </span>
                        <Link to="/register" className="font-bold text-brand-blue hover:text-blue-700 underline decoration-2 decoration-transparent hover:decoration-brand-blue transition-all">
                            Regístrate Gratis
                        </Link>
                    </div>
                </form>
            </div>
            {/* Footer / Copyright */}
            <div className="absolute bottom-4 text-blue-200 text-xs text-center opacity-60">
                &copy; {new Date().getFullYear()} Cuadra SaaS. Todos los derechos reservados.
            </div>
        </div >
    );
}
