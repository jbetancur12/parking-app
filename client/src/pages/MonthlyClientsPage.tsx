import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Plus, RefreshCw, Search, X, Download } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

interface Client {
    id: number;
    plate: string;
    name: string;
    phone?: string;
    vehicleType?: string;
    startDate: string;
    endDate: string;
    monthlyRate: number;
    isActive: boolean;
}



import { useReactToPrint } from 'react-to-print';
import { PrintMonthlyReceipt } from '../components/PrintMonthlyReceipt';

export default function MonthlyClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
    const [error, setError] = useState('');

    // Form State
    const [plate, setPlate] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [monthlyRate, setMonthlyRate] = useState('50000');
    const [vehicleType, setVehicleType] = useState('CAR');

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Printing
    const componentRef = React.useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);

    // Using contentRef pattern consistent with ParkingPage
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Recibo_Mensualidad',
        onAfterPrint: () => setPrintData(null),
    });

    const triggerPrint = (data: any) => {
        setPrintData(data);
        // Small timeout to ensure render before printing, same as ParkingPage
        setTimeout(() => {
            handlePrint();
        }, 100);
    };


    useEffect(() => {
        fetchClients();
    }, [searchTerm]);

    const fetchClients = async () => {
        try {
            const response = await api.get(`/monthly?search=${searchTerm}`);
            setClients(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/monthly', {
                plate: plate.toUpperCase(),
                name,
                phone,
                vehicleType,
                monthlyRate: Number(monthlyRate)
            });

            setIsModalOpen(false);
            resetForm();
            fetchClients();

            // Trigger print
            const { client, payment } = response.data;
            console.log('Create Response:', response.data);

            if (client && payment) {
                if (confirm('¿Desea imprimir el recibo de la nueva mensualidad?')) {
                    triggerPrint({
                        paymentId: payment.id,
                        plate: client.plate,
                        clientName: client.name,
                        vehicleType: client.vehicleType,
                        amount: payment.amount,
                        periodStart: payment.periodStart,
                        periodEnd: payment.periodEnd,
                        paymentDate: payment.paymentDate,
                        concept: 'NUEVA MENSUALIDAD'
                    });
                }
            }

        } catch (err: any) {
            console.error('Create Error:', err);
            setError(err.response?.data?.message || 'Failed to create client');
        }
    };

    const handleRenew = async (clientId: number) => {
        const amountStr = prompt('Ingrese el monto a pagar (dejar vacío para usar tarifa mensual):');
        if (amountStr === null) return; // User cancelled

        const amount = Number(amountStr);
        if (isNaN(amount) || amount < 0) {
            alert('Invalid amount');
            return;
        }

        // Ask for payment method
        const paymentMethod = confirm('¿El pago es en EFECTIVO?\n\nOK = Efectivo\nCancelar = Transferencia')
            ? 'CASH'
            : 'TRANSFER';

        try {
            const res = await api.post(`/monthly/${clientId}/renew`, {
                amount: amount || undefined,
                paymentMethod
            });
            fetchClients();

            alert(`Renovado exitosamente!\nMétodo de pago: ${paymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia'}`);

            // Trigger print
            const { client, payment } = res.data;
            console.log('Renew Response:', res.data);

            if (client && payment) {
                if (confirm('¿Desea imprimir el recibo de renovación?')) {
                    triggerPrint({
                        paymentId: payment.id,
                        plate: client.plate,
                        clientName: client.name,
                        vehicleType: client.vehicleType,
                        amount: payment.amount,
                        periodStart: payment.periodStart,
                        periodEnd: payment.periodEnd,
                        paymentDate: payment.paymentDate,
                        concept: 'RENOVACIÓN'
                    });
                }
            }

        } catch (err: any) {
            // Handle generic or specific errors
            const msg = err.response?.data?.message || 'Error en renovación';
            alert(msg);
        }
    };

    const handleHistory = async (client: Client) => {
        try {
            setSelectedClient(client);
            const res = await api.get(`/monthly/${client.id}/history`);
            setHistory(res.data);
            setHistoryModalOpen(true);
        } catch (err) {
            alert('Failed to fetch history');
        }
    };

    const handleReprintHistory = (payment: any) => {
        if (!selectedClient) return;
        triggerPrint({
            paymentId: payment.id,
            plate: selectedClient.plate,
            clientName: selectedClient.name,
            vehicleType: selectedClient.vehicleType,
            amount: payment.amount,
            periodStart: payment.periodStart,
            periodEnd: payment.periodEnd,
            paymentDate: payment.paymentDate,
            concept: 'COPIA DE RECIBO'
        });
    };

    const handleToggleStatus = async (clientId: number) => {
        if (!confirm('¿Está seguro de cambiar el estado de este cliente?')) return;
        try {
            await api.patch(`/monthly/${clientId}/status`);
            fetchClients();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const resetForm = () => {
        setPlate('');
        setName('');
        setPhone('');
        setError('');
    };

    // Filter clients based on status
    const filteredClients = clients.filter(client => {
        // If searching, show all matches regardless of strict status filtering
        if (searchTerm) return true;

        const now = new Date();
        const endDate = new Date(client.endDate);
        const isExpired = endDate < now;

        // ACTIVE: Active AND Not Expired
        if (filterStatus === 'ACTIVE') return client.isActive && !isExpired;

        // EXPIRED: Active AND Expired (Candidates for deactivation or renewal)
        if (filterStatus === 'EXPIRED') return client.isActive && isExpired;

        // ALL: Show all Active (Expired or Not) - Hide Inactive unless searched?
        // Let's hide inactive by default to keep list clean, unless in 'ALL' we want everything?
        // User wants to "hide" them. So Inactive should ONLY show in search.
        if (filterStatus === 'ALL') return client.isActive;

        return true;
    });

    const handleExport = () => {
        const exportData = filteredClients.map(client => ({
            'Placa': client.plate,
            'Nombre': client.name,
            'Teléfono': client.phone || '',
            'Tipo Vehículo': client.vehicleType || '',
            'Tarifa Mensual': client.monthlyRate,
            'Fecha Inicio': new Date(client.startDate).toLocaleDateString(),
            'Fecha Fin': new Date(client.endDate).toLocaleDateString(),
            'Estado': client.isActive ? 'Activo' : 'Inactivo'
        }));

        const filename = `Clientes_Mensuales_${filterStatus}_${new Date().toISOString().split('T')[0]}`;
        exportToExcel(exportData, filename, 'Clientes');
    };

    return (
        <div>
            {/* Print Component mimicking ParkingPage structure */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <PrintMonthlyReceipt
                        ref={componentRef}
                        data={printData}
                    />
                )}
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="mr-3" /> Clientes Mensuales
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2" size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-4 py-2 rounded-md ${filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterStatus('ACTIVE')}
                    className={`px-4 py-2 rounded-md ${filterStatus === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    Activos
                </button>
                <button
                    onClick={() => setFilterStatus('EXPIRED')}
                    className={`px-4 py-2 rounded-md ${filterStatus === 'EXPIRED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    Vencidos
                </button>
                <button
                    onClick={handleExport}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <Download size={18} />
                    Exportar
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o placa (incluso desactivados)..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Create Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Nuevo Cliente Mensual</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Placa</label>
                                <input
                                    type="text"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 uppercase"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tarifa Mensual</label>
                                <input
                                    type="number"
                                    value={monthlyRate}
                                    onChange={(e) => setMonthlyRate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                <select
                                    value={vehicleType}
                                    onChange={(e) => setVehicleType(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="CAR">Carro</option>
                                    <option value="MOTORCYCLE">Moto</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                            >
                                Crear Cliente
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyModalOpen && selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Historial: {selectedClient.name} ({selectedClient.plate})</h2>
                            <button onClick={() => setHistoryModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((payment: any) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({Math.round((new Date(payment.periodEnd).getTime() - new Date(payment.periodStart).getTime()) / (1000 * 60 * 60 * 24))} días)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                ${Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleReprintHistory(payment)}
                                                    className="text-blue-600 hover:text-blue-900 text-xs font-medium bg-blue-50 px-2 py-1 rounded"
                                                >
                                                    Imprimir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-4 text-gray-500">No se encontró historial</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Clients List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map((client) => {
                            const isExpired = new Date(client.endDate) < new Date();
                            return (
                                <tr key={client.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                        <div className="text-sm text-gray-500 font-mono">{client.plate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {client.phone || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            {client.isActive ? (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {isExpired ? 'Vencido' : 'Activo'}
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 w-fit">
                                                    Desactivado
                                                </span>
                                            )}
                                            <div className="text-xs text-gray-400 mt-1">
                                                Vence: {new Date(client.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleHistory(client)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium"
                                        >
                                            Historial
                                        </button>

                                        {/* Renewal is always available */}
                                        <button
                                            onClick={() => handleRenew(client.id)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-full text-xs font-medium"
                                            title="Renovar y Activar"
                                        >
                                            <RefreshCw size={14} className="inline mr-1" />
                                            Renovar
                                        </button>

                                        {/* Deactivate/Activate button */}
                                        {client.isActive ? (
                                            isExpired && (
                                                <button
                                                    onClick={() => handleToggleStatus(client.id)}
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium"
                                                >
                                                    Desactivar
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => handleToggleStatus(client.id)}
                                                className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-full text-xs font-medium"
                                            >
                                                Activar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredClients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No hay clientes {filterStatus === 'ACTIVE' ? 'activos' : filterStatus === 'EXPIRED' ? 'vencidos' : ''}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
