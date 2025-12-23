import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Key, Shield, AlertCircle } from 'lucide-react';

const LICENSE_SERVER_URL = import.meta.env.VITE_LICENSE_SERVER_URL || 'http://localhost:3002';

export default function LicenseActivationPage() {
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const formatLicenseKey = (value: string) => {
        // Remove all non-alphanumeric characters
        const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

        // Split into groups of 4
        const groups = cleaned.match(/.{1,4}/g) || [];

        // Join with hyphens, max 4 groups (PARK-XXXX-XXXX-XXXX-XXXX)
        return groups.slice(0, 4).join('-');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatLicenseKey(e.target.value);
        setLicenseKey(formatted);
    };

    const handleActivate = async () => {
        if (licenseKey.length < 19) { // PARK-XXXX-XXXX-XXXX-XXXX = 24 chars with hyphens
            setError('Clave de licencia incompleta');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get hardware ID
            const hardwareId = await (window as any).electronAPI.getHardwareId();

            // Call activation endpoint
            const response = await fetch(`${LICENSE_SERVER_URL}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: `PARK-${licenseKey}`, hardwareId })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al activar la licencia');
                setLoading(false);
                return;
            }

            // Save license locally via Electron
            await (window as any).electronAPI.activateLicense(data.signedLicense);

            toast.success('¡Licencia activada exitosamente!');

            // Redirect to setup or main app
            navigate('/setup');
        } catch (err: any) {
            console.error('Activation error:', err);
            setError(err.message || 'Error de conexión con el servidor de licencias');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTrial = async () => {
        setLoading(true);
        setError('');

        try {
            await (window as any).electronAPI.startTrial();
            toast.success('Trial de 14 días iniciado');
            navigate('/setup');
        } catch (err: any) {
            console.error('Trial start error:', err);
            setError(err.message || 'Ya usaste el trial en este dispositivo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activar Licencia</h1>
                        <p className="text-gray-600">ParkingSof Desktop Edition</p>
                    </div>

                    {/* License Key Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Clave de Licencia
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Key className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={licenseKey}
                                onChange={handleInputChange}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                                maxLength={19}
                                disabled={loading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Ingresa la clave sin el prefijo "PARK-"
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Activate Button */}
                    <button
                        onClick={handleActivate}
                        disabled={loading || licenseKey.length < 19}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
                    >
                        {loading ? 'Activando...' : 'Activar Licencia'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">o</span>
                        </div>
                    </div>

                    {/* Trial Button */}
                    <button
                        onClick={handleStartTrial}
                        disabled={loading}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
                    >
                        Probar Gratis 14 Días
                    </button>

                    {/* Links */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            ¿No tienes licencia?{' '}
                            <a
                                href="https://tuapp.com/comprar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Comprar ahora
                            </a>
                        </p>
                        <p className="text-xs text-gray-500">
                            ¿Problemas?{' '}
                            <a
                                href="https://tuapp.com/soporte"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:underline"
                            >
                                Contacta soporte
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    La licencia se vincula a este dispositivo. Puedes transferirla contactando soporte.
                </p>
            </div>
        </div>
    );
}
