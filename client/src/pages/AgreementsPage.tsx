import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Power } from 'lucide-react';
import { useAgreementsPage } from '../hooks/useAgreementsPage';
import { AgreementList } from '../components/agreements/AgreementList';
import { AgreementForm } from '../components/agreements/AgreementForm';

export default function AgreementsPage() {
    const { user } = useAuth();
    const {
        agreements,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isSubmitting,
        name,
        setName,
        type,
        setType,
        value,
        setValue,
        description,
        setDescription,
        handleCreate,
        handleToggleStatus
    } = useAgreementsPage();

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'LOCATION_MANAGER') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-4">
                    <Power className="w-12 h-12 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acceso Restringido</h3>
                <p>No tienes permisos para ver esta página.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <Briefcase className="mr-2 text-blue-600 dark:text-blue-400" /> Gestión de Convenios
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Convenio
                </button>
            </div>

            <AgreementList agreements={agreements} onToggleStatus={handleToggleStatus} />

            {isCreateModalOpen && (
                <AgreementForm
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isSubmitting={isSubmitting}
                    name={name}
                    setName={setName}
                    type={type}
                    setType={setType}
                    value={value}
                    setValue={setValue}
                    description={description}
                    setDescription={setDescription}
                />
            )}
        </div>
    );
}
