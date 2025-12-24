import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSaas } from '../context/SaasContext';
import { Building2, MousePointerClick, LogOut } from 'lucide-react';

export default function LocationSelectionPage() {
    const { user, logout } = useAuth();
    const { setCurrentLocation } = useSaas();
    const navigate = useNavigate();

    const handleSelectLocation = (location: any) => {
        setCurrentLocation(location);
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Selecciona tu Sede</h1>
                    <p className="mt-2 text-gray-600">Hola, {user.username}. ¿Desde dónde operarás hoy?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.locations.map((location) => (
                        <button
                            key={location.id}
                            onClick={() => handleSelectLocation(location)}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 text-left border border-gray-100 hover:border-blue-200"
                        >
                            <div className="absolute top-6 right-6 text-gray-300 group-hover:text-blue-500 transition-colors">
                                <MousePointerClick size={24} />
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {location.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Sede Operativa
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={logout}
                        className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={18} className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
