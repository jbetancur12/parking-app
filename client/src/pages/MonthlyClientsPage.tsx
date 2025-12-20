import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { settingService } from '../services/setting.service';
import { Users, Plus, RefreshCw, Search, X, Download, AlertTriangle } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { PrintMonthlyReceipt } from '../components/PrintMonthlyReceipt';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { toast } from 'sonner';

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
    const [settings, setSettings] = useState<any>(null);
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

    // Renewal Modal State
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [renewClientData, setRenewClientData] = useState<{ id: number; rate: number } | null>(null);
    const [renewAmount, setRenewAmount] = useState('');
    const [renewPaymentMethod, setRenewPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'primary' | 'danger' | 'warning';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    // Printing
    const componentRef = React.useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);

    const handlePrint = useElectronPrint({
        contentRef: componentRef,
        onAfterPrint: () => setPrintData(null),
    });

    const triggerPrint = (data: any) => {
        setPrintData(data);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const fetchClients = async () => {
        try {
            const response = await api.get(`/monthly?search=${searchTerm}`);
            setClients(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar clientes');
        }
    };

    const fetchSettings = async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchSettings();
    }, [searchTerm]);

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
            toast.success('Cliente creado exitosamente');

            // Print Receipt Confirmation
            const { client, payment } = response.data;
            if (client && payment) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Imprimir Recibo',
                    message: '¿Desea imprimir el recibo de la nueva mensualidad?',
                    type: 'primary',
                    onConfirm: () => {
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
                        closeConfirmModal();
                    }
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear cliente');
        }
    };

    const openRenewModal = (client: Client) => {
        setRenewClientData({ id: client.id, rate: client.monthlyRate });
        setRenewAmount(client.monthlyRate.toString());
        setRenewPaymentMethod('CASH');
        setIsRenewModalOpen(true);
    };

    const handleRenewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renewClientData) return;

        try {
            const res = await api.post(`/monthly/${renewClientData.id}/renew`, {
                amount: Number(renewAmount),
                paymentMethod: renewPaymentMethod
            });
            fetchClients();
            setIsRenewModalOpen(false);
            toast.success(`Renovado exitosamente (${renewPaymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia'})`);

            // Print Receipt Confirmation
            const { client, payment } = res.data;
            if (client && payment) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Imprimir Recibp',
                    message: '¿Desea imprimir el recibo de renovación?',
                    type: 'primary',
                    onConfirm: () => {
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
                        closeConfirmModal();
                    }
                });
            }

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error en renovación');
        }
    };

    const handleHistory = async (client: Client) => {
        try {
            setSelectedClient(client);
            const res = await api.get(`/monthly/${client.id}/history`);
            setHistory(res.data);
            setHistoryModalOpen(true);
        } catch (err) {
            toast.error('Error al obtener historial');
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

    const handleToggleStatus = (clientId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Cambiar Estado',
            message: '¿Está seguro de cambiar el estado de este cliente?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await api.patch(`/monthly/${clientId}/status`);
                    fetchClients();
                    toast.success('Estado actualizado correctamente');
                } catch (err) {
                    toast.error('Error al actualizar estado');
                }
                closeConfirmModal();
            }
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
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
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
                type={confirmModal.type}
            />

            {/* Print Component mimicking ParkingPage structure */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <PrintMonthlyReceipt
                        ref={componentRef}
                        data={printData}
                        settings={settings}
                    />
                )}
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="mr-3" /> Clientes Mensuales
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="mr-2" size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterStatus('ACTIVE')}
                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    Activos
                </button>
                <button
                    onClick={() => setFilterStatus('EXPIRED')}
                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'EXPIRED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    Vencidos
                </button>
                <button
                    onClick={handleExport}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Create Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Nuevo Cliente Mensual</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center"><AlertTriangle size={16} className="mr-2" />{error}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Placa</label>
                                <input
                                    type="text"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tarifa Mensual</label>
                                    <input
                                        type="number"
                                        value={monthlyRate}
                                        onChange={(e) => setMonthlyRate(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                    <select
                                        value={vehicleType}
                                        onChange={(e) => setVehicleType(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="CAR">Carro</option>
                                        <option value="MOTORCYCLE">Moto</option>
                                        <option value="OTHER">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors mt-2"
                            >
                                Crear Cliente
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Renew Client Modal */}
            {isRenewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <RefreshCw className="mr-2 text-green-600" size={20} />
                                Renovar Suscripción
                            </h2>
                            <button onClick={() => setIsRenewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleRenewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar</label>
                                <input
                                    type="number"
                                    value={renewAmount}
                                    onChange={(e) => setRenewAmount(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                                    required
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Tarifa actual del cliente: ${renewClientData?.rate.toLocaleString()}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRenewPaymentMethod('CASH')}
                                        className={`py-2 px-4 rounded-lg border font-medium text-sm transition-all ${renewPaymentMethod === 'CASH'
                                            ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        💵 Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRenewPaymentMethod('TRANSFER')}
                                        className={`py-2 px-4 rounded-lg border font-medium text-sm transition-all ${renewPaymentMethod === 'TRANSFER'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        🏦 Transferencia
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-bold shadow-sm transition-colors mt-2"
                            >
                                Confirmar Renovación
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* History Modal */}
            {historyModalOpen && selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Historial de Pagos</h2>
                                <p className="text-sm text-gray-500">{selectedClient.name} - {selectedClient.plate}</p>
                            </div>
                            <button onClick={() => setHistoryModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors"><X size={20} /></button>
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
                                        <tr key={payment.id} className="hover:bg-gray-50">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                ${Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleReprintHistory(payment)}
                                                    className="text-blue-600 hover:text-blue-900 text-xs font-medium bg-blue-50 px-3 py-1 rounded-full transition-colors hover:bg-blue-100"
                                                >
                                                    Imprimir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-gray-500 italic">No se encontró historial de pagos</td></tr>
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
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
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
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                        >
                                            Historial
                                        </button>

                                        <button
                                            onClick={() => openRenewModal(client)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-full text-xs font-medium transition-colors"
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
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                                                >
                                                    Desactivar
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => handleToggleStatus(client.id)}
                                                className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-full text-xs font-medium transition-colors"
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
