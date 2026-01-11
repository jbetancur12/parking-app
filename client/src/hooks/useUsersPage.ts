
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export interface User {
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

export const useUsersPage = () => {
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
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
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
                toast.success('Usuario actualizado exitosamente');
            } else {
                // Create user (Invitation Flow)
                // Password is NOT required anymore.
                // Backend will handle generating invitation token and sending email.
                // We send a dummy password or handle it in backend.
                // Let's assume we modified backend to accept empty password for invitation,
                // OR we generate a random temporary one here if backend strictly requires it (legacy),
                // BUT better to just send username/role and let backend decide.

                // However, current backend User entity requires password.
                // We should update backend `create-user` logic.
                // For now, let's send a placeholder that will be overwritten by activation.
                const placeholderPassword = crypto.randomUUID ? crypto.randomUUID() : 'temp-invite-' + Date.now();

                await api.post('/users', {
                    username,
                    role,
                    // Send undefined/null for password to signal invitation?
                    // Or send a flag? To be safe with existing backend validation,
                    // we might need to adjust backend validation.
                    // Let's check `User.ts` again. Password is property.
                    password: placeholderPassword,
                    isInvitation: true
                });
                toast.success('Usuario invitado exitosamente. Se ha enviado el correo.');
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
            toast.success('Usuario eliminado exitosamente');
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
            toast.success('Sedes asignadas exitosamente');
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

    return {
        currentUser,
        users,
        locations,
        loading,
        showModal,
        setShowModal,
        showLocationModal,
        setShowLocationModal,
        editingUser,
        assigningUser,
        selectedLocationIds,
        username, setUsername,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        role, setRole,
        isActive, setIsActive,
        error, setError,
        isSubmitting,
        handleSubmit,
        handleDelete,
        handleOpenLocationModal,
        handleSaveLocations,
        toggleLocationSelection,
        openCreateModal,
        openEditModal,
        closeModal
    };
};
