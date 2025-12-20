import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Car, Bike, Truck, X, Search, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PrintTicket } from '../components/PrintTicket';
import { PrintReceipt } from '../components/PrintReceipt';

interface ParkingSession {
    id: number;
    plate: string;
    vehicleType: string;
    entryTime: string;
    planType?: string;
}

export default function ParkingPage() {
    const [sessions, setSessions] = useState<ParkingSession[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    // Entry Form State
    const [plate, setPlate] = useState('');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [planType, setPlanType] = useState('HOUR');
    const [error, setError] = useState('');

    // Exit State
    const [exitResult, setExitResult] = useState<any>(null);
    const [previewData, setPreviewData] = useState<any>(null);

    // Print refs
    const ticketRef = React.useRef<HTMLDivElement>(null);
    const receiptRef = React.useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);

    const handlePrintTicket = useReactToPrint({
        contentRef: ticketRef,
    });

    const handlePrintReceipt = useReactToPrint({
        contentRef: receiptRef,
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/parking/active');
            setSessions(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/parking/entry', { plate: plate.toUpperCase(), vehicleType, planType });
            const newSession = response.data;

            // Save for printing
            setPrintData({
                type: 'ticket',
                session: {
                    id: newSession.id,
                    plate: newSession.plate,
                    vehicleType: newSession.vehicleType,
                    entryTime: newSession.entryTime,
                    planType: newSession.planType
                }
            });

            setIsEntryModalOpen(false);
            setPlate('');
            fetchSessions();

            // Show print option
            if (confirm(`Vehículo registrado: ${newSession.plate}\n\n¿Desea imprimir el ticket?`)) {
                setTimeout(() => handlePrintTicket(), 100);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar entrada');
        }
    };

    const handleExitClick = async (plate: string) => {
        try {
            const response = await api.get(`/parking/preview/${plate}`);
            setPreviewData(response.data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al obtener vista previa');
        }
    };

    const confirmExit = async () => {
        if (!previewData) return;
        try {
            const response = await api.post('/parking/exit', { plate: previewData.plate });
            const exitData = response.data;

            // Calculate duration for display
            const entry = new Date(exitData.entryTime);
            const exit = new Date(exitData.exitTime);
            const diffMs = exit.getTime() - entry.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const duration = `${hours}h ${minutes}m`;

            // Save for printing
            setPrintData({
                type: 'receipt',
                session: {
                    id: exitData.id,
                    plate: exitData.plate,
                    vehicleType: exitData.vehicleType,
                    entryTime: exitData.entryTime,
                    exitTime: exitData.exitTime,
                    planType: exitData.planType,
                    cost: exitData.cost,
                    duration
                }
            });

            setExitResult(exitData);
            setPreviewData(null);
            fetchSessions();

            // Show print option
            if (confirm(`Salida registrada\nTotal: $${exitData.cost.toLocaleString()}\n\n¿Desea imprimir el recibo?`)) {
                setTimeout(() => handlePrintReceipt(), 100);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error al registrar salida');
        }
    };

    const filteredSessions = sessions.filter(session =>
        session.plate.includes(searchTerm.toUpperCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Parqueadero</h1>
                <button
                    onClick={() => setIsEntryModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2" size={20} />
                    Nueva Entrada
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar vehículo por placa..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Preview Modal */}
            {previewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmar Salida</h2>
                        <div className="space-y-3 mb-6">
                            <p className="text-lg"><strong>Placa:</strong> {previewData.plate}</p>
                            <p className="text-lg"><strong>Plan:</strong> {previewData.planType === 'DAY' ? 'Por Día' : 'Por Hora'}</p>
                            <p className="text-lg"><strong>Duración:</strong> {Math.floor(previewData.durationMinutes / 60)}h {previewData.durationMinutes % 60}m</p>
                            <div className="border-t pt-2 mt-2">
                                <p className="text-sm text-gray-500">Total a Pagar</p>
                                <p className="text-3xl font-bold text-green-600">${previewData.cost}</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setPreviewData(null)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmExit}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                Confirmar Salida
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exit Receipt Modal/Overlay */}
            {exitResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-green-600">Salida Exitosa</h2>
                        <div className="space-y-2 mb-6">
                            <p><strong>Placa:</strong> {exitResult.session.plate}</p>
                            <p><strong>Duración:</strong> {exitResult.durationMinutes} min</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">Total: ${exitResult.cost}</p>
                        </div>
                        <button
                            onClick={() => setExitResult(null)}
                            className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                        >
                            Cerrar
                        </button>
                        {/* Print Button Placeholder */}
                        <button
                            onClick={() => window.print()}
                            className="w-full mt-2 border border-gray-300 text-gray-600 py-2 rounded hover:bg-gray-50"
                        >
                            Imprimir Recibo
                        </button>
                    </div>
                </div>
            )}

            {/* Entry Modal */}
            {isEntryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Ingreso de Vehículo</h2>
                            <button onClick={() => setIsEntryModalOpen(false)}><X size={20} /></button>
                        </div>

                        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleEntrySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Placa</label>
                                <input
                                    type="text"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 uppercase"
                                    placeholder="ABC-123"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {['CAR', 'MOTORCYCLE', 'OTHER'].map((type) => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setVehicleType(type)}
                                            className={`py-2 text-sm rounded-md border ${vehicleType === type
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700'
                                                }`}
                                        >
                                            {type === 'CAR' ? 'CARRO' : type === 'MOTORCYCLE' ? 'MOTO' : 'OTRO'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Plan de Facturación</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setPlanType('HOUR')}
                                        className={`py-2 text-sm rounded-md border ${planType === 'HOUR'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        Por Hora
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlanType('DAY')}
                                        className={`py-2 text-sm rounded-md border ${planType === 'DAY'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        Por Día
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                            >
                                Registrar Entrada
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSessions.map((session) => (
                                <tr key={session.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="flex items-center">
                                            {session.vehicleType === 'CAR' ? <Car size={18} className="mr-2 text-gray-500" /> :
                                                session.vehicleType === 'MOTORCYCLE' ? <Bike size={18} className="mr-2 text-gray-500" /> :
                                                    <Truck size={18} className="mr-2 text-gray-500" />}
                                            {session.vehicleType === 'CAR' ? 'CARRO' : session.vehicleType === 'MOTORCYCLE' ? 'MOTO' : 'OTRO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{session.plate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(session.entryTime).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.planType === 'DAY' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                            {session.planType === 'DAY' ? 'Por Día' : 'Por Hora'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleExitClick(session.plate)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 text-xs px-3 py-1 rounded-full font-medium"
                                        >
                                            Salida
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSessions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron vehículos con esa placa.' : 'No hay vehículos activos.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden Print Components */}
            <div style={{ display: 'none' }}>
                {printData && printData.type === 'ticket' && (
                    <PrintTicket ref={ticketRef} session={printData.session} />
                )}
                {printData && printData.type === 'receipt' && (
                    <PrintReceipt ref={receiptRef} session={printData.session} />
                )}
            </div>
        </div>
    );
}
