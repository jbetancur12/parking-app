import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Lock, Unlock, Key, Building } from 'lucide-react';
import { userService } from '../../services/user.service';
import type { User } from '../../services/user.service';

export default function AdminUserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResetModal, setShowResetModal] = useState<number | null>(null); // userId
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState<{ userId: number; username: string; action: 'activate' | 'deactivate' } | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadUsers = async (search?: string) => {
        try {
            setLoading(true);
            const data = await userService.getAll(search);
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        setShowConfirmModal({
            userId: user.id,
            username: user.username,
            action: user.isActive ? 'deactivate' : 'activate'
        });
    };

    const confirmToggleStatus = async () => {
        if (!showConfirmModal) return;
        try {
            const newStatus = showConfirmModal.action === 'activate';
            await userService.toggleStatus(showConfirmModal.userId, newStatus);
            loadUsers(searchTerm);
            setShowConfirmModal(null);
            setShowSuccessModal(`Usuario ${showConfirmModal.action === 'activate' ? 'activado' : 'desactivado'} correctamente`);
        } catch (error) {
            setShowConfirmModal(null);
            setShowErrorModal('Error al actualizar estado del usuario');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showResetModal || !newPassword) return;

        if (newPassword !== confirmPassword) {
            setShowErrorModal('Las contraseñas no coinciden');
            return;
        }

        try {
            await userService.changePassword(showResetModal, newPassword);
            setShowResetModal(null);
            setNewPassword('');
            setConfirmPassword('');
            setShowSuccessModal('Contraseña actualizada correctamente');
        } catch (error) {
            setShowErrorModal('Error al actualizar contraseña');
        }
    };

    const handleCloseModal = () => {
        setShowResetModal(null);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Gestión Global de Usuarios
                </h1>
                <p className="text-gray-600">
                    Administra acceso, contraseñas y bloqueos de todos los usuarios del sistema.
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tenant(s)</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <UserIcon size={20} className="text-brand-blue" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.username}</p>
                                                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {user.tenants && user.tenants.length > 0 ? (
                                                    user.tenants.map(t => (
                                                        <div key={t.id} className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Building size={14} />
                                                            {t.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Sin asignar</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowResetModal(user.id)}
                                                    className="p-2 text-gray-500 hover:text-brand-yellow hover:bg-yellow-50 rounded-lg transition-colors"
                                                    title="Cambiar Contraseña"
                                                >
                                                    <Key size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isActive
                                                        ? 'text-red-500 hover:bg-red-50'
                                                        : 'text-green-500 hover:bg-green-50'
                                                        }`}
                                                    title={user.isActive ? 'Bloquear / Desactivar' : 'Desbloquear / Activar'}
                                                >
                                                    {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Resetear Contraseña</h2>
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    placeholder="Ingresa nueva contraseña"
                                    minLength={6}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                <input
                                    type="text"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    placeholder="Confirma la contraseña"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Toggle Status Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Acción</h2>
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de {showConfirmModal.action === 'activate' ? 'activar' : 'desactivar'} a <strong>{showConfirmModal.username}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                className={`px-4 py-2 font-bold rounded-lg ${showConfirmModal.action === 'activate'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {showConfirmModal.action === 'activate' ? 'Activar' : 'Desactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Éxito</h2>
                        </div>
                        <p className="text-gray-700 mb-6">{showSuccessModal}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSuccessModal(null)}
                                className="px-4 py-2 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-xl p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-100 p-3 rounded-full mr-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Error</h2>
                        </div>
                        <p className="text-gray-700 mb-6">{showErrorModal}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowErrorModal(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
