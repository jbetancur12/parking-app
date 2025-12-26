import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface TicketStatus {
    id: number;
    plate: string;
    vehicleType: string;
    entryTime: string;
    planType: string;
    cost: number;
    durationMinutes: number;
    currentTime: string;
}

export default function TicketStatusPage() {
    const { id } = useParams();
    const [status, setStatus] = useState<TicketStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Direct axios call to bypass auth interceptor if configured globally
                // But our interceptor only adds token if present, so it should be fine.
                // However, we need to ensure we hit the public endpoint.
                const response = await axios.get(`${API_URL}/parking/public/status/${id}`);
                setStatus(response.data);
            } catch (err) {
                console.error(err);
                setError('No se pudo encontrar el ticket o ya no está activo.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStatus();
            // Poll every minute for real-time updates
            const interval = setInterval(fetchStatus, 60000);
            return () => clearInterval(interval);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !status) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Ticket Invalido</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full relative">
                <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-1">Estado de Cuenta</h1>
                        <p className="opacity-90 text-sm">Parqueadero</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="inline-block bg-blue-50 px-4 py-2 rounded-full mb-2">
                            <span className="text-blue-800 font-bold text-xl tracking-wider">{status.plate}</span>
                        </div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">{status.vehicleType}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <Calendar className="mx-auto text-gray-400 mb-1" size={18} />
                            <p className="text-gray-500 text-xs">Entrada</p>
                            <p className="font-semibold text-gray-800 text-sm">
                                {new Date(status.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(status.entryTime).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <Clock className="mx-auto text-gray-400 mb-1" size={18} />
                            <p className="text-gray-500 text-xs">Tiempo</p>
                            <p className="font-semibold text-gray-800 text-sm">
                                {Math.floor(status.durationMinutes / 60)}h {status.durationMinutes % 60}m
                            </p>
                            <p className="text-xs text-gray-400">Transcurrido</p>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 font-medium flex items-center">
                                <DollarSign size={16} className="mr-1" />
                                Total a Pagar
                            </span>
                        </div>
                        <div className="text-4xl font-extrabold text-blue-600 text-center py-2">
                            ${status.cost.toLocaleString()}
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-2">
                            * El valor puede cambiar al momento de la salida.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                    Consultado: {new Date(status.currentTime).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}
