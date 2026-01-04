import { useState } from 'react';
import api from '../../services/api';
import { useShift } from '../../context/ShiftContext';
import { useSaas } from '../../context/SaasContext';
import { useAuth } from '../../context/AuthContext';

export const useShiftActions = () => {
    const { activeShift, checkActiveShift } = useShift();
    const { currentLocation } = useSaas();
    const { user } = useAuth();

    // UI State for Actions
    const [baseAmount, setBaseAmount] = useState('');
    const [error, setError] = useState('');

    // Close Shift State
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const [closedShiftData, setClosedShiftData] = useState<any>(null);

    const handleOpenShift = async () => {
        if (!currentLocation) {
            setError('Debe seleccionar una sede activa para iniciar turno');
            return;
        }

        try {
            await api.post('/shifts/open', {
                baseAmount: Number(baseAmount),
                locationId: currentLocation.id
            });
            await checkActiveShift();
            setError('');
            setBaseAmount('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to open shift');
        }
    };

    const handleCloseShift = async (declaredAmount: number, notes: string) => {
        if (!activeShift) return;

        try {
            const response = await api.post('/shifts/close', {
                declaredAmount: declaredAmount || 0,
                notes
            });

            const { summary } = response.data;

            // Save data for printing
            setClosedShiftData({
                summary,
                shift: {
                    startTime: activeShift.startTime,
                    endTime: new Date().toISOString()
                },
                user: { username: user?.username || 'Usuario' }
            });

            setSummaryData(summary);
            setShowSummaryModal(true);
            setShowCloseModal(false);

            await checkActiveShift();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to close shift');
        }
    };

    return {
        activeShift,
        baseAmount,
        setBaseAmount,
        error,
        setError,
        showCloseModal,
        setShowCloseModal,
        showSummaryModal,
        setShowSummaryModal,
        summaryData,
        closedShiftData,
        handleOpenShift,
        handleCloseShift
    };
};
