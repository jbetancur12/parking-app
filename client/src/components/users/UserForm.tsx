
import React from 'react';
import { X } from 'lucide-react';

interface UserFormProps {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    error: string;
    username: string;
    setUsername: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    role: string;
    setRole: (value: string) => void;
    isActive: boolean;
    setIsActive: (value: boolean) => void;
    editingUser: any;
    currentUserRole?: string;
}

export const UserForm: React.FC<UserFormProps> = ({
    onSubmit,
    onCancel,
    isSubmitting,
    error,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    isActive,
    setIsActive,
    editingUser,
    currentUserRole
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl transition-all border dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contraseña {editingUser && '(Opcional)'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            required={!editingUser}
                            placeholder={editingUser ? 'Dejar en blanco para mantener actual' : ''}
                        />
                    </div>

                    {(password || !editingUser) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                required={!editingUser || !!password}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rol
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            {currentUserRole === 'SUPER_ADMIN' && (
                                <option value="SUPER_ADMIN">Super Administrador</option>
                            )}
                            <option value="ADMIN">Administrador</option>
                            <option value="LOCATION_MANAGER">Administrador de Sede</option>
                            <option value="OPERATOR">Operador</option>
                            <option value="CASHIER">Cajero</option>
                        </select>
                    </div>

                    {editingUser && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="mr-2 h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Usuario Activo
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 bg-brand-blue text-white py-2 rounded-md hover:bg-blue-800 transition-colors font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
