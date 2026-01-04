import { useState, useRef } from 'react';
import { Users, Plus, Download } from 'lucide-react';
import { useMonthlyClients, type Client } from '../hooks/useMonthlyClients';
import { useElectronPrint } from '../hooks/useElectronPrint';
import { ClientFilterBar } from '../components/monthly/ClientFilterBar';
import { MonthlyClientTable } from '../components/monthly/MonthlyClientTable';
import { MonthlyClientForm } from '../components/monthly/MonthlyClientForm';
import { RenewalModal } from '../components/monthly/RenewalModal';
import { HistoryModal } from '../components/monthly/HistoryModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { PrintMonthlyReceipt } from '../components/PrintMonthlyReceipt';
import { exportToExcel } from '../utils/excelExport';

export default function MonthlyClientsPage() {
    const {
        clients,
        settings,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        createClient,
        renewClient,
        toggleStatus,
        anonymizeClient,
        getHistory
    } = useMonthlyClients();

    // Modal Visibility State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Confirmation Modal State (Global/Shared)
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

    // Printing System
    const componentRef = useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);

    const handlePrint = useElectronPrint({
        contentRef: componentRef,
        onAfterPrint: () => setPrintData(null),
        silent: settings?.show_print_dialog === 'false'
    });

    const triggerPrint = (data: any) => {
        setPrintData(data);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    // --- Handlers ---

    const handleCreateSubmit = async (data: any) => {
        const response = await createClient(data);
        setIsCreateModalOpen(false);

        // Printing Logic for New Client
        const { client, payment, receiptNumber } = response;
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
                        concept: 'NUEVA MENSUALIDAD',
                        receiptNumber
                    });
                    closeConfirmModal();
                }
            });
        }
    };

    const handleRenewSubmit = async (id: number, data: { amount: number, paymentMethod: string }) => {
        const response = await renewClient(id, data);

        // Printing Logic for Renewal
        const { client, payment, receiptNumber } = response;
        if (client && payment) {
            // We might need to wait for themodal to close fully or just show confirm on top (?)
            // Currently logic shows confirm after success toast in hook? No, hook returns data.
            setConfirmModal({
                isOpen: true,
                title: 'Imprimir Recibo',
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
                        concept: 'RENOVACIÓN',
                        receiptNumber
                    });
                    closeConfirmModal();
                }
            });
        }
    };

    const onRenewClick = (client: Client) => {
        setSelectedClient(client);
        setIsRenewModalOpen(true);
    };

    const onHistoryClick = (client: Client) => {
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
    };

    const onToggleStatusClick = (clientId: number, isActive: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: isActive ? 'Desactivar Cliente' : 'Activar Cliente',
            message: `¿Está seguro de ${isActive ? 'desactivar' : 'activar'} este cliente?`,
            type: 'warning',
            onConfirm: async () => {
                await toggleStatus(clientId);
                closeConfirmModal();
            }
        });
    };

    const onAnonymizeClick = (clientId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Derecho al Olvido (Eliminación Legal)',
            message: '¿Está seguro de ANONIMIZAR este cliente? Esta acción es IRREVERSIBLE. Se eliminará el Nombre, Teléfono y Placa. El historial de pagos se mantendrá anónimo.',
            type: 'danger',
            onConfirm: async () => {
                await anonymizeClient(clientId);
                closeConfirmModal();
            }
        });
    };

    const handleExport = () => {
        const exportData = clients.map(client => ({
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

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-display font-bold text-brand-blue dark:text-white w-full md:w-auto text-center md:text-left flex items-center justify-center md:justify-start">
                    <Users className="mr-2" /> Clientes Mensuales
                </h1>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 shadow-md flex items-center justify-center flex-1 md:flex-none whitespace-nowrap"
                    >
                        <Plus className="mr-2" size={18} />
                        Nuevo Cliente
                    </button>

                    <button
                        onClick={handleExport}
                        className="text-brand-blue dark:text-blue-300 border border-brand-blue dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 font-medium flex-1 md:flex-none"
                    >
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Filters */}
            <ClientFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {/* Table */}
            <MonthlyClientTable
                clients={clients}
                filterStatus={filterStatus}
                onHistory={onHistoryClick}
                onRenew={onRenewClick}
                onToggleStatus={onToggleStatusClick}
                onAnonymize={onAnonymizeClick}
            />

            {/* Modals */}
            <MonthlyClientForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
            />

            <RenewalModal
                isOpen={isRenewModalOpen}
                onClose={() => setIsRenewModalOpen(false)}
                client={selectedClient}
                onRenew={handleRenewSubmit}
            />

            <HistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                client={selectedClient}
                fetchHistory={getHistory}
                onReprint={(payment) => {
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
                        concept: 'COPIA DE RECIBO',
                        receiptNumber: payment.receiptNumber // Added receiptNumber
                    });
                }}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
                type={confirmModal.type}
            />

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <PrintMonthlyReceipt
                        ref={componentRef}
                        data={printData}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    );
}
