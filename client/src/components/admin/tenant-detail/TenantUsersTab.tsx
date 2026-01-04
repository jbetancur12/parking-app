import React from 'react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import type { Tenant, User } from '../../../hooks/useTenantDetail';

interface TenantUsersTabProps {
    tenant: Tenant;
    openCreateUserModal: () => void;
    openEditUserModal: (user: User) => void;
    removeUserFromTenant: (userId: number) => void;
}

export const TenantUsersTab: React.FC<TenantUsersTabProps> = ({
    tenant,
    openCreateUserModal,
    openEditUserModal,
    removeUserFromTenant
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-brand-blue dark:text-blue-300">Usuarios</h3>
                <button
                    onClick={openCreateUserModal}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 shadow-md transition-transform active:scale-95"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                </button>
            </div>
            {tenant.users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay usuarios asignados</p>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {tenant.users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{user.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEditUserModal(user)}
                                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Editar Usuario"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => removeUserFromTenant(user.id)}
                                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Remover acceso"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
