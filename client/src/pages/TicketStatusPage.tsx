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
    const { ticketId } = useParams();
    const [status, setStatus] = useState<TicketStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Direct axios call to bypass auth interceptor if configured globally
                // But our interceptor only adds token if present, so it should be fine.
                // However, we need to ensure we hit the public endpoint.
                const response = await axios.get(`${API_URL}/parking/public/status/${ticketId}`);
                setStatus(response.data);
            } catch (err) {
                console.error(err);
                setError('No se pudo encontrar el ticket o ya no está activo.');
            } finally {
                setLoading(false);
            }
        };

        if (ticketId) {
            fetchStatus();
            // Poll every minute for real-time updates
            const interval = setInterval(fetchStatus, 60000);
            return () => clearInterval(interval);
        }
    }, [ticketId]);

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

        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full relative">
                <div className="bg-brand-blue p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <img src="/LogoTexto.png" alt="Aparca" className="h-8 mb-4 brightness-0 invert" />
                        <h1 className="text-2xl font-display font-bold mb-1">Estado de Cuenta</h1>
                        <p className="opacity-80 text-sm font-sans">Parqueadero</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="inline-block bg-blue-50 px-6 py-3 rounded-xl mb-2 border border-blue-100">
                            <span className="text-brand-blue font-display font-black text-3xl tracking-wider">{status.plate}</span>
                        </div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide font-bold">{status.vehicleType}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                            <Calendar className="mx-auto text-brand-blue mb-2 opacity-70" size={20} />
                            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Entrada</p>
                            <p className="font-bold text-gray-800 text-sm font-display">
                                {new Date(status.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(status.entryTime).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                            <Clock className="mx-auto text-brand-blue mb-2 opacity-70" size={20} />
                            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Tiempo</p>
                            <p className="font-bold text-gray-800 text-sm font-display">
                                {Math.floor(status.durationMinutes / 60)}h {status.durationMinutes % 60}m
                            </p>
                            <p className="text-xs text-gray-400">Transcurrido</p>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-100 pt-6">
                        <div className="flex items-center justify-center mb-2">
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                                Total a Pagar
                            </span>
                        </div>
                        <div className="flex items-center justify-center text-4xl font-display font-black text-brand-green py-2">
                            <DollarSign size={28} className="mr-1 mt-1" />
                            {status.cost.toLocaleString()}
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-brand-yellow text-brand-blue font-bold px-6 py-3 rounded-lg shadow-md hover:brightness-105 active:scale-95 transition-all text-sm uppercase tracking-wide w-full"
                            >
                                Actualizar Estado
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                            * El valor mostrado es informativo y puede cambiar al momento de la salida definitiva.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 text-center text-[10px] text-gray-400 border-t border-gray-100 font-mono">
                    ID: #{status.id} • Consultado: {new Date(status.currentTime).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}
