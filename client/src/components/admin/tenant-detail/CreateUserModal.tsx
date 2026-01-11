import React from 'react';
import type { User } from '../../../hooks/useTenantDetail';

interface CreateUserModalProps {
    editingUser: User | null;
    newUser: any;
    setNewUser: (user: any) => void;
    handleSubmitUser: (e: React.FormEvent) => void;
    setShowAddUserModal: (show: boolean) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
    editingUser,
    newUser,
    setNewUser,
    handleSubmitUser,
    setShowAddUserModal
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transition-colors">
                <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300 mb-4">
                    {editingUser ? 'Editar Usuario' : 'Crear y Asignar Usuario'}
                </h3>
                <form onSubmit={handleSubmitUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Username *
                        </label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="admin.empresa"
                        />
                    </div>
                    {/* Password Fields - Only for Editing */}
                    {editingUser && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Cambiar Contraseña (Opcional)</p>
                            <div className="space-y-3">
                                <div>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        placeholder="Nueva contraseña"
                                    />
                                </div>
                                {newUser.password && (
                                    <div>
                                        <input
                                            type="password"
                                            value={newUser.confirmPassword}
                                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                            required={!!newUser.password}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            placeholder="Confirmar nueva contraseña"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!editingUser && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Nota:</strong> Se enviará un correo de bienvenida al usuario para que active su cuenta y establezca su contraseña.
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Rol *
                        </label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="LOCATION_MANAGER">LOCATION_MANAGER</option>
                            <option value="OPERATOR">OPERATOR</option>
                            <option value="CASHIER">CASHIER</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800"
                        >
                            {editingUser ? 'Actualizar' : 'Invitar y Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
