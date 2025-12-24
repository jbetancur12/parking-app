import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface User {
    id: number;
    username: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    location?: {
        id: string;
        name: string;
    };
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    CASHIER: 'Cajero'
};

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('OPERATOR');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchLocations();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            // Fetch locations for dropdown (admin endpoints available if ADMIN/SUPER_ADMIN)
            const response = await api.get('/admin/locations');
            setLocations(response.data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                // Update user
                await api.put(`/users/${editingUser.id}`, { username, role, isActive });
            } else {
                // Create user
                if (!password) {
                    setError('La contraseña es requerida');
                    return;
                }
                await api.post('/users', { username, password, role });
            }

            fetchUsers();
            closeModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    const handleAssignLocation = async (userId: number, locationId: string | null) => {
        try {
            await api.post(`/users/${userId}/assign-location`, { locationId });
            fetchUsers(); // Refresh users to show updated location
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al asignar sede');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setRole('OPERATOR');
        setIsActive(true);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setUsername(user.username);
        setPassword('');
        setRole(user.role);
        setIsActive(user.isActive);
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        return (
            <div className="p-8">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    No tienes permisos para acceder a esta página.
                </div>
            </div>
        );
    }

    if (loading) return <div className="p-8">Cargando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2" size={20} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sede Asignada</th>
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
                                    <select
                                        value={user.location?.id || ''}
                                        onChange={(e) => handleAssignLocation(user.id, e.target.value || null)}
                                        className="text-sm border rounded-md px-2 py-1 bg-white"
                                        disabled={currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN'}
                                    >
                                        <option value="">Sin asignar</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
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
                                        onClick={() => openEditModal(user)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={closeModal}><X size={20} /></button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                        required
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
                                    <option value="SUPER_ADMIN">Super Administrador</option>
                                    <option value="ADMIN">Administrador</option>
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
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                                >
                                    {editingUser ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
