import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { settingService } from '../services/setting.service';
import { useElectronPrint } from './useElectronPrint';

export interface ClosedShift {
    id: number;
    user: {
        id: number;
        username: string;
    };
    startTime: string;
    endTime: string;
    baseAmount: number;
    totalIncome: number;
    totalExpenses: number;
    declaredAmount: number;
    expectedCash: number;
    difference: number;
    notes?: string;
    cashIncome?: number;
    transferIncome?: number;
}

export const useShiftHistoryPage = () => {
    const { user: currentUser } = useAuth();
    const [shifts, setShifts] = useState<ClosedShift[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedShift, setSelectedShift] = useState<ClosedShift | null>(null);

    // Print ref
    const shiftSummaryRef = useRef<HTMLDivElement>(null);

    const handlePrintShiftSummary = useElectronPrint({
        contentRef: shiftSummaryRef,
        silent: settings?.show_print_dialog === 'false'
    });

    useEffect(() => {
        fetchClosedShifts();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    };

    const fetchClosedShifts = async () => {
        try {
            const response = await api.get('/shifts/closed');
            setShifts(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (shift: ClosedShift) => {
        setSelectedShift(shift);
        setTimeout(() => handlePrintShiftSummary(), 100);
    };

    const hasPermission = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'LOCATION_MANAGER';

    return {
        shifts,
        loading,
        selectedShift,
        settings,
        shiftSummaryRef,
        handlePrint,
        hasPermission
    };
};
