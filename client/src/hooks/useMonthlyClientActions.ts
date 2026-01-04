import { useState, useRef } from 'react';
import type { Client } from './useMonthlyClients';
import { useElectronPrint } from './useElectronPrint';
import { exportToExcel } from '../utils/excelExport';

interface UseMonthlyClientActionsProps {
    clients: Client[];
    settings: any;
    createClient: (data: any) => Promise<any>;
    renewClient: (id: number, data: any) => Promise<any>;
    toggleStatus: (id: number) => Promise<void>;
    anonymizeClient: (id: number) => Promise<void>;
}

export const useMonthlyClientActions = ({
    clients,
    settings,
    createClient,
    renewClient,
    toggleStatus,
    anonymizeClient,
}: UseMonthlyClientActionsProps) => {
    // Modal Visibility State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
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

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    // Printing System
    const printRef = useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<any>(null);

    const handlePrint = useElectronPrint({
        contentRef: printRef,
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
        const { client, payment, receiptNumber } = response;

        if (client && payment) {
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
        // Close Modal after success
        setIsRenewModalOpen(false);
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

    const handleExport = (filterStatus: string) => {
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

    return {
        // State
        isCreateModalOpen, setIsCreateModalOpen,
        isRenewModalOpen, setIsRenewModalOpen,
        isHistoryModalOpen, setIsHistoryModalOpen,
        selectedClient,
        confirmModal,
        closeConfirmModal,

        // Print
        printRef,
        printData,
        triggerPrint,

        // Handlers
        handleCreateSubmit,
        handleRenewSubmit,
        onRenewClick,
        onHistoryClick,
        onToggleStatusClick,
        onAnonymizeClick,
        handleExport
    };
};
