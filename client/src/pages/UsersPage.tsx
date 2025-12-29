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
    locations: Array<{
        id: string;
        name: string;
    }>;
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    LOCATION_MANAGER: 'Administrador de Sede',
    OPERATOR: 'Operador',
    CASHIER: 'Cajero'
};

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
    const [assigningUser, setAssigningUser] = useState<User | null>(null);

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('OPERATOR');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Permission Check
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <X className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
                <p>No tienes permisos para ver esta página.</p>
            </div>
        );
    }

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
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (editingUser) {
                // Update user
                if (password && password !== confirmPassword) {
                    setError('Las contraseñas no coinciden');
                    setIsSubmitting(false);
                    return;
                }
                const updateData: any = { username, role, isActive };
                if (password) {
                    updateData.password = password;
                }
                await api.put(`/users/${editingUser.id}`, updateData);
            } else {
                // Create user
                if (!password) {
                    setError('La contraseña es requerida');
                    setIsSubmitting(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Las contraseñas no coinciden');
                    setIsSubmitting(false);
                    return;
                }
                await api.post('/users', { username, password, role });
            }

            fetchUsers();
            closeModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al eliminar usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenLocationModal = (user: User) => {
        setAssigningUser(user);
        setSelectedLocationIds(user.locations?.map(l => l.id) || []);
        setShowLocationModal(true);
    };

    const handleSaveLocations = async () => {
        if (!assigningUser || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.post(`/users/${assigningUser.id}/assign-location`, { locationIds: selectedLocationIds });
            fetchUsers();
            setShowLocationModal(false);
            setAssigningUser(null);
            setSelectedLocationIds([]);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al asignar sedes');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleLocationSelection = (locationId: string) => {
        setSelectedLocationIds(prev =>
            prev.includes(locationId)
                ? prev.filter(id => id !== locationId)
                : [...prev, locationId]
        );
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setRole('OPERATOR');
        setIsActive(true);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setUsername(user.username);
        setUsername(user.username);
        setPassword('');
        setConfirmPassword('');
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
                                                onClick={() => handleOpenLocationModal(user)}
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
                                    {currentUser?.role === 'SUPER_ADMIN' && (
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

            {/* Location Assignment Modal */}
            {showLocationModal && assigningUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                Asignar Sedes: {assigningUser.username}
                            </h2>
                            <button onClick={() => setShowLocationModal(false)}><X size={20} /></button>
                        </div>

                        <div className="mb-4 max-h-60 overflow-y-auto border rounded-md">
                            {locations.length === 0 ? (
                                <p className="p-4 text-gray-500 text-center">No hay sedes disponibles.</p>
                            ) : (
                                locations.map(loc => (
                                    <div key={loc.id} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0">
                                        <input
                                            type="checkbox"
                                            id={`loc-${loc.id}`}
                                            checked={selectedLocationIds.includes(loc.id)}
                                            onChange={() => toggleLocationSelection(loc.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`loc-${loc.id}`} className="ml-3 block text-sm text-gray-700 cursor-pointer flex-1">
                                            {loc.name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveLocations}
                                disabled={isSubmitting}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Asignaciones'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
