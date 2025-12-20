import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Car, Bike, Truck, X, Search, Printer, Clock, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PrintTicket } from '../components/PrintTicket';
import { PrintReceipt } from '../components/PrintReceipt';
import { toast } from 'sonner';

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


    // Exit State
    const [exitResult, setExitResult] = useState<any>(null);
    const [previewData, setPreviewData] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [discount, setDiscount] = useState('');
    const [discountReason, setDiscountReason] = useState('');
    const [agreements, setAgreements] = useState<any[]>([]);
    const [selectedAgreementId, setSelectedAgreementId] = useState('');
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);
    const [pendingPrintSession, setPendingPrintSession] = useState<any>(null);

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

        // Fetch active agreements
        api.get('/agreements/active')
            .then(res => setAgreements(res.data))
            .catch(err => console.error('Error fetching agreements', err));
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

            // Show print confirmation modal
            setPendingPrintSession(newSession);
            setShowPrintConfirm(true);
            toast.success('Vehículo ingresado');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al registrar entrada');
        }
    };

    const handleConfirmPrint = () => {
        setShowPrintConfirm(false);
        if (pendingPrintSession) {
            setTimeout(() => handlePrintTicket(), 100);
        }
        setPendingPrintSession(null);
    };

    const handleCancelPrint = () => {
        setShowPrintConfirm(false);
        setPendingPrintSession(null);
    };

    const handleExitClick = async (plate: string) => {
        try {
            const response = await api.get(`/parking/preview/${plate}`);
            setPreviewData(response.data);
            setDiscount('');
            setDiscountReason('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al obtener vista previa');
        }
    };

    const confirmExit = async () => {
        if (!previewData) return;
        try {
            const response = await api.post('/parking/exit', {
                plate: previewData.plate,
                paymentMethod,
                discount: discount ? Number(discount) : 0,
                discountReason,
                agreementId: selectedAgreementId
            });
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

            toast.success('Salida registrada correctamente');

            // Show print option
            // Changed from confirm() to using the modal UI we already have (PrintReceipt Modal)
            // But if we want instant print query:
            toast('¿Desea imprimir recibo?', {
                action: {
                    label: 'Imprimir',
                    onClick: () => setTimeout(() => handlePrintReceipt(), 100)
                }
            });

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al registrar salida');
        }
    };

    const handleReprintTicket = (session: ParkingSession) => {
        // Set print data for the selected session
        setPrintData({
            type: 'ticket',
            session: {
                id: session.id,
                plate: session.plate,
                vehicleType: session.vehicleType,
                entryTime: session.entryTime,
                planType: session.planType
            }
        });

        // Print after a short delay to ensure state is updated
        setTimeout(() => handlePrintTicket(), 100);
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
                    placeholder="Buscar por placa o escanear ticket..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchTerm) {
                            const exactMatch = sessions.find(s => s.plate === searchTerm);
                            if (exactMatch) {
                                handleExitClick(exactMatch.plate);
                                setSearchTerm('');
                            }
                        }
                    }}
                    autoFocus
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

                            {/* Payment Method Selector */}
                            <div className="border-t pt-3 mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('CASH')}
                                        className={`py-2 text-sm rounded-md border ${paymentMethod === 'CASH'
                                            ? 'bg-green-50 border-green-500 text-green-700 font-semibold'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        💵 Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('TRANSFER')}
                                        className={`py-2 text-sm rounded-md border ${paymentMethod === 'TRANSFER'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                                            : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        🏦 Transferencia
                                    </button>
                                </div>
                            </div>

                            {/* Agreements Selector */}
                            {agreements.length > 0 && (
                                <div className="border-t pt-3 mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Convenio / Descuento Predefinido</label>
                                    <select
                                        value={selectedAgreementId}
                                        onChange={(e) => {
                                            setSelectedAgreementId(e.target.value);
                                            // Reset manual details if agreement selected? Or keep them?
                                            // Let's reset manual discount to avoid confusion
                                            if (e.target.value) {
                                                setDiscount('');
                                                setDiscountReason('');
                                            }
                                        }}
                                        className="w-full border rounded-md px-2 py-2"
                                    >
                                        <option value="">-- Seleccionar Convenio --</option>
                                        {agreements.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} ({a.type === 'FREE_HOURS' ? `${a.value}h Gratis` : a.type === 'PERCENTAGE' ? `${a.value}%` : `$${a.value}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Manual Discount Section */}
                            <div className="border-t pt-3 mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento Manual (Opcional)</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => {
                                            setDiscount(e.target.value);
                                            if (e.target.value) setSelectedAgreementId(''); // Deselect agreement if manual entry
                                        }}
                                        placeholder="Monto ($)"
                                        disabled={!!selectedAgreementId}
                                        className="w-1/3 border rounded-md px-2 py-1 text-right disabled:bg-gray-100"
                                    />
                                    <input
                                        type="text"
                                        value={discountReason}
                                        onChange={(e) => setDiscountReason(e.target.value)}
                                        placeholder="Razón (ej. Convenio)"
                                        disabled={!!selectedAgreementId}
                                        className="w-2/3 border rounded-md px-2 py-1 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Subtotal:</span>
                                    <span>${previewData.cost}</span>
                                </div>
                                {discount && Number(discount) > 0 && (
                                    <div className="flex justify-between text-sm text-red-500 mb-1">
                                        <span>Descuento:</span>
                                        <span>-${discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Total a Pagar</span>
                                    <span className="text-3xl font-bold text-green-600">
                                        {/* Dynamic Calculation */}
                                        {(() => {
                                            const originalCost = previewData.cost;
                                            let finalDiscount = 0;

                                            if (selectedAgreementId) {
                                                const agreement = agreements.find(a => a.id.toString() === selectedAgreementId);
                                                if (agreement) {
                                                    if (agreement.type === 'FREE_HOURS') {
                                                        const hourlyRate = previewData.hourlyRate || 0;
                                                        finalDiscount = hourlyRate * agreement.value;
                                                    } else if (agreement.type === 'PERCENTAGE') {
                                                        finalDiscount = (originalCost * agreement.value) / 100;
                                                    } else if (agreement.type === 'FLAT_DISCOUNT') {
                                                        finalDiscount = agreement.value;
                                                    }
                                                }
                                            } else if (discount) {
                                                finalDiscount = Number(discount) || 0;
                                            }

                                            // Cap discount to cost
                                            finalDiscount = Math.min(originalCost, finalDiscount);
                                            const finalTotal = Math.max(0, originalCost - finalDiscount);

                                            return `$${finalTotal.toLocaleString()}`;
                                        })()}
                                    </span>
                                </div>
                            </div>
                            {/* Visual breakdown of applied discount */}
                            {(selectedAgreementId || (discount && Number(discount) > 0)) && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-800">
                                    <span className="font-bold">Descuento aplicado: </span>
                                    {selectedAgreementId
                                        ? (() => {
                                            const a = agreements.find(a => a.id.toString() === selectedAgreementId);
                                            return a ? `${a.name} (${a.type === 'FREE_HOURS' ? `${a.value}h` : a.type === 'PERCENTAGE' ? `${a.value}%` : `$${a.value}`})` : '';
                                        })()
                                        : `Manual ($${discount})`
                                    }
                                </div>
                            )}
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

            {/* Print Confirmation Modal */}
            {showPrintConfirm && pendingPrintSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-green-600">✅ Vehículo Registrado</h2>
                        <div className="space-y-2 mb-6">
                            <p><strong>Placa:</strong> {pendingPrintSession.plate}</p>
                            <p><strong>Tipo:</strong> {pendingPrintSession.vehicleType === 'CAR' ? 'Carro' : 'Moto'}</p>
                            <p><strong>Plan:</strong> {pendingPrintSession.planType === 'DAY' ? 'Por Día' : 'Por Hora'}</p>
                        </div>
                        <p className="text-gray-600 mb-6">¿Desea imprimir el ticket de entrada?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancelPrint}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                            >
                                No, gracias
                            </button>
                            <button
                                onClick={handleConfirmPrint}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                🖨️ Sí, Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Exit Receipt Modal/Overlay */}
            {
                exitResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                            <h2 className="text-xl font-bold mb-4 text-green-600">Salida Exitosa</h2>
                            <div className="space-y-2 mb-6">
                                <p><strong>Placa:</strong> {exitResult.plate}</p>
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
                )
            }

            {/* Entry Modal */}
            {
                isEntryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Ingreso de Vehículo</h2>
                                <button onClick={() => setIsEntryModalOpen(false)}><X size={20} /></button>
                            </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { type: 'CAR', icon: Car, label: 'Carro' },
                                            { type: 'MOTORCYCLE', icon: Bike, label: 'Moto' },
                                            { type: 'OTHER', icon: Truck, label: 'Otro' }
                                        ].map(({ type, icon: Icon, label }) => (
                                            <button
                                                type="button"
                                                key={type}
                                                onClick={() => setVehicleType(type)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${vehicleType === type
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm transform scale-[1.02]'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon size={28} className="mb-1" />
                                                <span className="text-xs font-bold">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan de Facturación</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPlanType('HOUR')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${planType === 'HOUR'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Clock size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Por Hora</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPlanType('DAY')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${planType === 'DAY'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-purple-200 hover:bg-purple-50'
                                                }`}
                                        >
                                            <Calendar size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Por Día</span>
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
                )
            }

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleReprintTicket(session)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"
                                                title="Reimprimir ticket"
                                            >
                                                <Printer size={14} />
                                                Ticket
                                            </button>
                                            <button
                                                onClick={() => handleExitClick(session.plate)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 text-xs px-3 py-1 rounded-full font-medium"
                                            >
                                                Salida
                                            </button>
                                        </div>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredSessions.map((session) => (
                    <div key={session.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                {session.vehicleType === 'CAR' ? <Car className="text-blue-500" size={24} /> :
                                    session.vehicleType === 'MOTORCYCLE' ? <Bike className="text-orange-500" size={24} /> :
                                        <Truck className="text-gray-500" size={24} />}

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{session.plate}</h3>
                                    <span className="text-xs text-gray-500 uppercase">{session.vehicleType === 'CAR' ? 'Carro' : session.vehicleType === 'MOTORCYCLE' ? 'Moto' : 'Otro'}</span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${session.planType === 'DAY' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                {session.planType === 'DAY' ? 'Día' : 'Hora'}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 border-t pt-2 mt-1">
                            <div className="flex justify-between">
                                <span>Entrada:</span>
                                <span className="font-medium">{new Date(session.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button
                                onClick={() => handleReprintTicket(session)}
                                className="flex items-center justify-center gap-2 bg-gray-100 text-blue-700 py-2 rounded-lg font-medium text-sm active:bg-gray-200"
                            >
                                <Printer size={16} /> Ticket
                            </button>
                            <button
                                onClick={() => handleExitClick(session.plate)}
                                className="flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 rounded-lg font-medium text-sm active:bg-red-200"
                            >
                                <X size={16} /> Salida
                            </button>
                        </div>
                    </div>
                ))}
                {filteredSessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Car size={48} className="mx-auto text-gray-300 mb-2" />
                        <p>{searchTerm ? 'No se encontraron vehículos.' : 'No hay vehículos activos.'}</p>
                    </div>
                )}
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
        </div >
    );
}
