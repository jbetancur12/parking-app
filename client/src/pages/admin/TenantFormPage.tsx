import { ArrowLeft } from 'lucide-react';
import { useTenantForm } from '../../hooks/useTenantForm';
import { TenantForm } from '../../components/admin/tenants/TenantForm';

export default function TenantFormPage() {
    const {
        formData,
        loading,
        isEdit,
        handleChange,
        handleSubmit,
        navigate
    } = useTenantForm();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/tenants')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isEdit ? 'Actualizar información de la empresa' : 'Crear un nuevo tenant en el sistema'}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
                <TenantForm
                    formData={formData}
                    loading={loading}
                    isEdit={isEdit}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/tenants')}
                />
            </div>
        </div>
    );
}
