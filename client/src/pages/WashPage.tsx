// React import not needed with new JSX transform
import { Car, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WashServicesModal } from '../components/dashboard/WashServicesModal';
import { useWashPage } from '../hooks/useWashPage';
import { WashEntryForm } from '../components/wash/WashEntryForm';
import { WashHistoryList } from '../components/wash/WashHistoryList';

export default function WashPage() {
    const { user } = useAuth();

    const {
        // Data
        types,
        entries,
        activeShift,

        // Form
        plate, setPlate,
        selectedType, setSelectedType,
        price, setPrice,
        operator, setOperator,
        paymentMethod, setPaymentMethod,

        // UI
        loading,
        message,
        modalOpen, setModalOpen,

        // Handlers
        handleCreate,
        loadTypes
    } = useWashPage();

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar servicios.</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue flex items-center">
                    <Car className="mr-2" /> Lavadero de Autos
                </h1>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER') && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
                    >
                        <Settings size={18} className="mr-2" />
                        Configurar Servicios
                    </button>
                )}
            </div>

            <WashServicesModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onUpdate={loadTypes}
            />

            {message && (
                <div className="mb-4 bg-brand-green/10 text-brand-green p-3 rounded-lg text-sm text-center font-bold border border-brand-green/20">
                    {message}
                </div>
            )}

            {/* Form */}
            <WashEntryForm
                onSubmit={handleCreate}
                loading={loading}
                types={types}
                plate={plate}
                setPlate={setPlate}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                price={price}
                setPrice={setPrice}
                operator={operator}
                setOperator={setOperator}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
            />

            {/* List */}
            <WashHistoryList entries={entries} />
        </div>
    );
}
