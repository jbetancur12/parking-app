
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../services/user.service';

export default function ProfilePage() {
    const { user, logout } = useAuth();

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Las nuevas contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            if (!user?.id) throw new Error("User ID not found");

            await userService.changePassword(user.id, newPassword, currentPassword);

            toast.success('Contraseña actualizada correctamente. Por favor inicia sesión de nuevo.');

            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Security: Logout user
            setTimeout(() => {
                logout();
            }, 1500);

        } catch (error: any) {
            console.error('Change password error:', error);
            const msg = error.response?.data?.message || 'Error al actualizar la contraseña';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
                <User className="mr-3 text-brand-blue" size={32} /> Mi Perfil
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 ml-11">Gestiona tu información personal y seguridad.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* User Info Card */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-brand-blue">
                        <div className="flex flex-col items-center mb-4">
                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue mb-3">
                                <User size={40} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center break-all">{user?.username}</h2>
                            <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                {user?.role}
                            </span>
                        </div>

                        <div className="space-y-3 mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Información</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">ID Usuario</span>
                                <span className="text-gray-900 dark:text-gray-300 font-mono">#{user?.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Estado</span>
                                <span className="text-green-600 font-semibold">Activo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Form */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b dark:border-gray-700 flex items-center">
                            <Shield className="mr-2 text-brand-yellow" size={20} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cambiar Contraseña</h3>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Contraseña Actual
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-colors"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Ingresa tu contraseña actual para verificar tu identidad.</p>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-700" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-colors"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Confirmar Nueva
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-10 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-colors"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-brand-yellow text-brand-blue font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-400 flex items-center shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="mr-2" size={18} />
                                        {loading ? 'Guardando...' : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
