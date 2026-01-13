import { Plus, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantsPage } from '../../hooks/useTenantsPage';
import { TenantList } from '../../components/admin/tenants/TenantList';
import { TenantFilter } from '../../components/admin/tenants/TenantFilter';
import { PlansInfoModal } from '../../components/admin/tenants/PlansInfoModal';

export default function TenantsPage() {
    const {
        tenants,
        loading,
        filter,
        setFilter,
        showPlansModal,
        setShowPlansModal,
        toggleTenantStatus,
        navigate
    } = useTenantsPage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-brand-blue dark:text-white">Gestión de Empresas</h1>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Administrar tenants del sistema</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPlansModal(true)}
                        className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
                    >
                        <Info className="mr-2 h-5 w-5" />
                        Ver Planes
                    </button>
                    <Link
                        to="/admin/tenants/new"
                        className="flex items-center px-4 py-2 bg-brand-yellow dark:bg-yellow-500 text-brand-blue dark:text-gray-900 font-bold rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Nueva Empresa
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <TenantFilter filter={filter} setFilter={setFilter} />

            {/* Table */}
            <TenantList
                tenants={tenants}
                loading={loading}
                toggleTenantStatus={toggleTenantStatus}
                navigate={navigate}
            />

            {/* Plans Modal */}
            <PlansInfoModal
                show={showPlansModal}
                onClose={() => setShowPlansModal(false)}
            />
        </div>
    );
}
