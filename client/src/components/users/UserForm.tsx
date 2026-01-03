
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onCancel}><X size={20} /></button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña {editingUser && '(Opcional)'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                            required={!editingUser}
                            placeholder={editingUser ? 'Dejar en blanco para mantener actual' : ''}
                        />
                    </div>

                    {(password || !editingUser) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                                required={!editingUser || !!password}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
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
                                className="mr-2"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Usuario Activo
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
