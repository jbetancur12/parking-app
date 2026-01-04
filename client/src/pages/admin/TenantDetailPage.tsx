import { ArrowLeft, Edit, Building2, MapPin, Users } from 'lucide-react';
import { useTenantDetail } from '../../hooks/useTenantDetail';
import { TenantInfoTab } from '../../components/admin/tenant-detail/TenantInfoTab';
import { TenantLocationsTab } from '../../components/admin/tenant-detail/TenantLocationsTab';
import { TenantUsersTab } from '../../components/admin/tenant-detail/TenantUsersTab';
import { TenantUsageCards } from '../../components/admin/TenantUsageCards';
import { CreateUserModal } from '../../components/admin/tenant-detail/CreateUserModal';
import { CreateLocationModal } from '../../components/admin/tenant-detail/CreateLocationModal';
import { UpdatePlanModal } from '../../components/admin/tenant-detail/UpdatePlanModal';

export default function TenantDetailPage() {
    const {
        tenant,
        loading,
        activeTab,
        setActiveTab,
        showAddUserModal,
        setShowAddUserModal,
        showAddLocationModal,
        setShowAddLocationModal,
        showPlanModal,
        setShowPlanModal,
        newUser,
        setNewUser,
        editingUser,
        newLocation,
        setNewLocation,
        selectedPlan,
        setSelectedPlan,
        createLocation,
        handleDeleteLocation,
        handleReactivateLocation,
        handleSubmitUser,
        openCreateUserModal,
        openEditUserModal,
        removeUserFromTenant,
        handleUpdatePlan,
        openPlanModal,
        navigate,
        id
    } = useTenantDetail();

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    if (!tenant) {
        return <div className="p-8 text-center">Empresa no encontrada</div>;
    }

    const tabs = [
        { id: 'info', label: 'Información', icon: Building2 },
        { id: 'locations', label: 'Sedes', icon: MapPin },
        { id: 'users', label: 'Usuarios', icon: Users },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/tenants')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-brand-blue dark:text-white">{tenant.name}</h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">@{tenant.slug}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/tenants/${id}/edit`)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Empresa
                </button>
            </div>

            {/* Usage Metrics */}
            <div className="mb-6">
                <TenantUsageCards tenantId={id!} />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-brand-blue text-brand-blue dark:text-blue-400 dark:border-blue-400 font-bold'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
                {activeTab === 'info' && (
                    <TenantInfoTab
                        tenant={tenant}
                        openPlanModal={openPlanModal}
                    />
                )}

                {activeTab === 'locations' && (
                    <TenantLocationsTab
                        tenant={tenant}
                        setShowAddLocationModal={setShowAddLocationModal}
                        handleDeleteLocation={handleDeleteLocation}
                        handleReactivateLocation={handleReactivateLocation}
                    />
                )}

                {activeTab === 'users' && (
                    <TenantUsersTab
                        tenant={tenant}
                        openCreateUserModal={openCreateUserModal}
                        openEditUserModal={openEditUserModal}
                        removeUserFromTenant={removeUserFromTenant}
                    />
                )}
            </div>

            {/* Modals */}
            {showAddUserModal && (
                <CreateUserModal
                    editingUser={editingUser}
                    newUser={newUser}
                    setNewUser={setNewUser}
                    handleSubmitUser={handleSubmitUser}
                    setShowAddUserModal={setShowAddUserModal}
                />
            )}

            {showAddLocationModal && (
                <CreateLocationModal
                    newLocation={newLocation}
                    setNewLocation={setNewLocation}
                    createLocation={createLocation}
                    setShowAddLocationModal={setShowAddLocationModal}
                />
            )}

            {showPlanModal && (
                <UpdatePlanModal
                    selectedPlan={selectedPlan}
                    setSelectedPlan={setSelectedPlan}
                    currentPlan={tenant.plan}
                    handleUpdatePlan={handleUpdatePlan}
                    setShowPlanModal={setShowPlanModal}
                />
            )}
        </div>
    );
}
