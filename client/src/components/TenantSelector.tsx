import { useSaas } from '../context/SaasContext';
import { Building2, MapPin } from 'lucide-react';

export default function TenantSelector() {
    const { availableTenants, currentTenant, setCurrentTenant } = useSaas();

    // Don't show selector if user has only one tenant (auto-selected)
    if (availableTenants.length <= 1) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <Building2 className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Seleccionar Empresa</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Tu usuario tiene acceso a múltiples empresas. Por favor, selecciona una para continuar.
                    </p>
                </div>

                <div className="space-y-3">
                    {availableTenants.map((tenant) => (
                        <button
                            key={tenant.id}
                            onClick={() => setCurrentTenant(tenant)}
                            className={`w-full rounded-lg border-2 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 ${currentTenant?.id === tenant.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                        >
                            <div className="flex items-center">
                                <MapPin className="mr-3 h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="font-semibold text-gray-900">{tenant.name}</div>
                                    <div className="text-sm text-gray-500">@{tenant.slug}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
