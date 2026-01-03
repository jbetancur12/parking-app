
import React from 'react';
import type { User } from '../../hooks/useUsersPage';
import { Edit2, Trash2 } from 'lucide-react';

interface UserListProps {
    users: User[];
    currentUser: any;
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    onManageLocations: (user: User) => void;
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    LOCATION_MANAGER: 'Administrador de Sede',
    OPERATOR: 'Operador',
    CASHIER: 'Cajero'
};

export const UserList: React.FC<UserListProps> = ({
    users,
    currentUser,
    onEdit,
    onDelete,
    onManageLocations
}) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sedes Asignadas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{user.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {roleLabels[user.role]}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        {user.locations?.length || 0} sedes
                                    </span>
                                    {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
                                        <button
                                            onClick={() => onManageLocations(user)}
                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                                        >
                                            Gestionar
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">
                                    {user.locations?.map(l => l.name).join(', ')}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(user.id)}
                                    className="text-red-600 hover:text-red-900"
                                    disabled={user.id === currentUser?.id}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
