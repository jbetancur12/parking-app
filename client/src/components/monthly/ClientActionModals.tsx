import React from 'react';
import type { Client } from '../../hooks/business/useMonthlyClients';
import { MonthlyClientForm } from './MonthlyClientForm';
import { RenewalModal } from './RenewalModal';
import { HistoryModal } from './HistoryModal';
import { ConfirmationModal } from '../ConfirmationModal';

interface ClientActionModalsProps {
    // Modals visibility
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (value: boolean) => void;
    isRenewModalOpen: boolean;
    setIsRenewModalOpen: (value: boolean) => void;
    isHistoryModalOpen: boolean;
    setIsHistoryModalOpen: (value: boolean) => void;

    // Data
    selectedClient: Client | null;

    // Actions
    onCreateSubmit: (data: any) => Promise<void>;
    onRenewSubmit: (id: number, data: any) => Promise<void>;
    getHistory: (id: number) => Promise<any>;

    // Confirmation
    confirmModal: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'primary' | 'danger' | 'warning';
        onCancel?: () => void;
    };
    closeConfirmModal: () => void;

    // Print Helper for History
    onHistoryReprint: (payment: any) => void;
}

export const ClientActionModals: React.FC<ClientActionModalsProps> = ({
    isCreateModalOpen, setIsCreateModalOpen,
    isRenewModalOpen, setIsRenewModalOpen,
    isHistoryModalOpen, setIsHistoryModalOpen,
    selectedClient,
    onCreateSubmit,
    onRenewSubmit,
    getHistory,
    confirmModal,
    closeConfirmModal,
    onHistoryReprint
}) => {
    return (
        <>
            <MonthlyClientForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={onCreateSubmit}
            />

            <RenewalModal
                isOpen={isRenewModalOpen}
                onClose={() => setIsRenewModalOpen(false)}
                client={selectedClient}
                onRenew={onRenewSubmit}
            />

            <HistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                client={selectedClient}
                fetchHistory={getHistory}
                onReprint={onHistoryReprint}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
                type={confirmModal.type}
            />
        </>
    );
};
