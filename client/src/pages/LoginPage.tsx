import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

// Detect if running in Electron
const isElectron = import.meta.env.VITE_APP_MODE === 'electron';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Unified check for Electron: License -> Setup
    useEffect(() => {
        if (!isElectron) return; // Skip in web version

        const initChecks = async () => {
            // 1. Check License first
            try {
                const result = await (window as any).electronAPI?.validateLicense();
                if (!result || !result.isValid) {
                    console.log('No valid license found, redirecting to /license');
                    navigate('/license');
                    return; // Stop here, do not check setup
                }
            } catch (error) {
                console.error('Error checking license:', error);
                navigate('/license');
                return;
            }

            // 2. Check Setup (only if license is valid)
            try {
                const response = await api.get('/auth/setup-status');
                if (!response.data.isConfigured) {
                    navigate('/setup');
                }
            } catch (error) {
                console.error('Error checking setup status', error);
            }
        };

        // Add a small delay to ensure Electron IPC is ready if necessary, 
        // though typically window.electronAPI is available on mount.
        initChecks();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = response.data.user;
            login(response.data.token, userData);

            // Redirect based on locations
            if (userData.locations && userData.locations.length > 1) {
                navigate('/select-location');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">ParkingSof</h1>
                    <p className="text-gray-600">Inicie sesión para continuar</p>
                </div>

                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <User size={20} />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Ingresar
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600">¿No tienes cuenta? </span>
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Regístrate Gratis
                        </Link>
                    </div>
                </form>
            </div>
        </div >
    );
}
