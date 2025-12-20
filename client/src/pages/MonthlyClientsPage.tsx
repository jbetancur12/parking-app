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
            await api.post('/monthly', {
                plate: plate.toUpperCase(),
                name,
                phone,
                vehicleType,
                monthlyRate: Number(monthlyRate)
            });
            setIsModalOpen(false);
            resetForm();
            fetchClients();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create client');
        }
    };

    const handleRenew = async (client: Client) => {
        const amountStr = prompt(`Renovar suscripción para ${client.plate}? Ingrese monto:`, client.monthlyRate.toString());
        if (amountStr === null) return; // Cancelled

        const amount = Number(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert('Invalid amount');
            return;
        }

        try {
            await api.post(`/monthly/${client.id}/renew`, { amount });
            fetchClients();
            alert('Renovado exitosamente!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error en renovación');
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

    const resetForm = () => {
        setPlate('');
        setName('');
        setPhone('');
        setError('');
    };

    // Filter clients based on status
    const filteredClients = clients.filter(client => {
        const now = new Date();
        const endDate = new Date(client.endDate);
        const isExpired = endDate < now;

        if (filterStatus === 'ACTIVE') return client.isActive && !isExpired;
        if (filterStatus === 'EXPIRED') return !client.isActive || isExpired;
        return true; // ALL
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
                    Todos ({clients.length})
                </button>
                <button
                    onClick={() => setFilterStatus('ACTIVE')}
                    className={`px-4 py-2 rounded-md ${filterStatus === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    Activos ({clients.filter(c => c.isActive && new Date(c.endDate) >= new Date()).length})
                </button>
                <button
                    onClick={() => setFilterStatus('EXPIRED')}
                    className={`px-4 py-2 rounded-md ${filterStatus === 'EXPIRED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    Vencidos ({clients.filter(c => !c.isActive || new Date(c.endDate) < new Date()).length})
                </button>
                <button
                    onClick={handleExport}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <Download size={18} />
                    Exportar a Excel
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o placa..."
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
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr><td colSpan={3} className="text-center py-4 text-gray-500">No se encontró historial</td></tr>
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
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {isExpired ? 'Vencido' : 'Activo'}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Vence: {new Date(client.endDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => viewHistory(client)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium"
                                        >
                                            Historial
                                        </button>
                                        <button
                                            onClick={() => handleRenew(client.id)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-full text-xs font-medium"
                                        >
                                            <RefreshCw size={14} className="inline mr-1" />
                                            Renovar
                                        </button>
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
