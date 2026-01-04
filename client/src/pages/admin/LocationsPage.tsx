import { Plus } from 'lucide-react';
import { useLocationsPage } from '../../hooks/useLocationsPage';
import { LocationList } from '../../components/admin/locations/LocationList';
import { LocationFormModal } from '../../components/admin/locations/LocationFormModal';
import { LocationFilter } from '../../components/admin/locations/LocationFilter';

export default function LocationsPage() {
    const {
        locations,
        tenants,
        loading,
        selectedTenant,
        setSelectedTenant,
        showForm,
        setShowForm,
        editingLocation,
        formData,
        setFormData,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleReactivate,
        resetForm,
        canCreate
    } = useLocationsPage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Sedes</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administrar locaciones de las empresas</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Nueva Sede
                    </button>
                )}
            </div>

            {/* Form Component (handles its own visibility check inside, or we check it here) */}
            {/* Checking here makes the parent cleaner if the component is purely a modal content block, but I put logic inside component to return null. Let's start with checking here just in case I want to animate it later, but for now simple conditional render */}
            {showForm && (
                <LocationFormModal
                    showForm={showForm}
                    editingLocation={editingLocation}
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    tenants={tenants}
                />
            )}

            {/* Tenant Filter */}
            <LocationFilter
                selectedTenant={selectedTenant}
                setSelectedTenant={setSelectedTenant}
                tenants={tenants}
            />

            {/* Locations Table */}
            <LocationList
                locations={locations}
                loading={loading}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleReactivate={handleReactivate}
            />
        </div>
    );
}
