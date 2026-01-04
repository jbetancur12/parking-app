import { Plus, X } from 'lucide-react';
import { useUsersPage } from '../hooks/useUsersPage';
import { UserList } from '../components/users/UserList';
import { UserForm } from '../components/users/UserForm';
import { LocationAssignmentModal } from '../components/users/LocationAssignmentModal';

export default function UsersPage() {
    const {
        currentUser,
        users,
        locations,
        loading,
        showModal,
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
        error,
        isSubmitting,
        handleSubmit,
        handleDelete,
        handleOpenLocationModal,
        handleSaveLocations,
        toggleLocationSelection,
        openCreateModal,
        openEditModal,
        closeModal
    } = useUsersPage();

    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-4">
                    <X className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acceso Restringido</h3>
                <p>No tienes permisos para ver esta página.</p>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                    <Plus className="mr-2" size={20} />
                    Nuevo Usuario
                </button>
            </div>

            <UserList
                users={users}
                currentUser={currentUser}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onManageLocations={handleOpenLocationModal}
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <UserForm
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                    error={error}
                    username={username}
                    setUsername={setUsername}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    role={role}
                    setRole={setRole}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    editingUser={editingUser}
                    currentUserRole={currentUser?.role}
                />
            )}

            {/* Location Assignment Modal */}
            {showLocationModal && assigningUser && (
                <LocationAssignmentModal
                    assigningUser={assigningUser}
                    locations={locations}
                    selectedLocationIds={selectedLocationIds}
                    onToggleSelection={toggleLocationSelection}
                    onSave={handleSaveLocations}
                    onCancel={() => setShowLocationModal(false)}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}
