import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../services/api';
import { settingService } from '../../services/setting.service';
import { tariffService, type Tariff } from '../../services/tariff.service';
import { useOffline } from '../../context/OfflineContext';
import { useShift } from '../../context/ShiftContext';
import { calculateOfflineCost } from '../../utils/pricing.utils';

interface ParkingSession {
    id: number | string;
    plate: string;
    vehicleType: string;
    entryTime: string;
    planType?: string;
    ticketNumber?: string;
}

/**
 * Custom hook for managing parking page operations including vehicle entry, exit, and printing.
 * 
 * This is the most complex hook in the application, handling:
 * - Vehicle entry/exit workflows
 * - Offline mode support with queue management
 * - Print confirmation flows for tickets and receipts
 * - Exit preview with pricing calculations
 * - Integration with shift management
 * 
 * @param {Function} handlePrintTicket - Callback to trigger ticket printing
 * @param {Function} [handlePrintReceipt] - Optional callback to trigger receipt printing
 * 
 * @returns {Object} Hook state and handlers
 * @returns {ParkingSession[]} returns.sessions - Active parking sessions
 * @returns {ParkingSession[]} returns.filteredSessions - Filtered sessions based on search
 * @returns {boolean} returns.loading - Loading state for initial data fetch
 * @returns {any} returns.settings - Application settings
 * @returns {Tariff[]} returns.tariffs - Pricing tariffs
 * @returns {any[]} returns.agreements - Active discount agreements
 * @returns {Function} returns.handleOpenEntryModal - Opens entry modal (checks for active shift)
 * @returns {Function} returns.handleEntrySubmit - Processes vehicle entry (online/offline)
 * @returns {Function} returns.handleExitClick - Initiates exit preview
 * @returns {Function} returns.confirmExit - Confirms and processes vehicle exit
 * @returns {Function} returns.handleReprintTicket - Reprints entry ticket
 * @returns {Function} returns.handleReprintTicket - Reprints entry ticket
 * @returns {Function} returns.handleReprintReceipt - Reprints exit receipt
 * @returns {Function} returns.handleDeleteSession - Cancels/Deletes a session (Admin only)
 * 
 * @example
 * ```tsx
 * const {
 *   sessions,
 *   handleOpenEntryModal,
 *   handleExitClick
 * } = useParkingPage(printTicket, printReceipt);
 * ```
 */
export const useParkingPage = (
    handlePrintTicket: () => void,
    handlePrintReceipt?: () => void
) => {
    // Data State
    const [sessions, setSessions] = useState<ParkingSession[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Context
    const { isOnline, addOfflineItem, removeOfflineItem, queue, isSyncing } = useOffline();
    const { activeShift } = useShift();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Print/Exit Flow State
    const [printData, setPrintData] = useState<any>(null);
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);
    const [pendingPrintSession, setPendingPrintSession] = useState<any>(null);

    // Exit Preview State
    const [previewData, setPreviewData] = useState<any>(null);
    const [exitResult, setExitResult] = useState<any>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            // Try to load from cache first for immediate display
            const cachedSettings = localStorage.getItem('offline_settings');
            const cachedTariffs = localStorage.getItem('offline_tariffs');
            if (cachedSettings) setSettings(JSON.parse(cachedSettings));
            if (cachedTariffs) setTariffs(JSON.parse(cachedTariffs));

            if (!isOnline) {
                setLoading(false);
                return;
            }

            // We can fetch in parallel
            try {
                const [settingsData, tariffsData, agreementsRes] = await Promise.all([
                    settingService.getAll(),
                    tariffService.getAll(),
                    api.get('/agreements/active')
                ]);

                // Update State
                setSettings(settingsData);
                setTariffs(tariffsData);
                setAgreements(agreementsRes.data);

                // Update Cache
                localStorage.setItem('offline_settings', JSON.stringify(settingsData));
                localStorage.setItem('offline_tariffs', JSON.stringify(tariffsData));

            } catch (error) {
                console.error('Error loading initial data', error);
                // Fallback to cache is already handled by initial load
            }
        };

        fetchData();
        fetchSessions();
    }, [isOnline]); // Re-run when online status changes to try syncing config

    // Polling / Queue Sync Effect
    useEffect(() => {
        if (isOnline && !isSyncing && queue.length === 0) {
            fetchSessions();
        }
    }, [isOnline, isSyncing, queue.length]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/parking/active');
            setSessions(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Entry Logic ---

    const handleOpenEntryModal = () => {
        if (!activeShift) {
            toast.error('Debe abrir un turno antes de registrar entradas', {
                duration: 4000,
                style: { border: '2px solid #EF4444' }
            });
            return;
        }
        setIsEntryModalOpen(true);
    };

    const handleEntrySubmit = async (e: React.FormEvent, data: { plate: string; vehicleType: string; planType: string }) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const { plate, vehicleType, planType } = data;

        // Offline Handling
        if (!isOnline) {
            const entryDate = new Date();
            const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
            const currentLocation = JSON.parse(localStorage.getItem('currentLocation') || '{}');

            addOfflineItem({
                type: 'ENTRY',
                payload: {
                    plate: plate.toUpperCase(),
                    vehicleType,
                    planType,
                    entryTime: entryDate.toISOString()
                },
                tenantId: currentTenant.id,
                locationId: currentLocation.id
            });

            // Mock session for printing
            setPrintData({
                type: 'ticket',
                session: {
                    id: 0,
                    plate: plate.toUpperCase(),
                    vehicleType,
                    entryTime: entryDate.toISOString(),
                    planType: planType,
                    ticketNumber: 'OFFLINE'
                }
            });

            setPendingPrintSession({
                plate: plate.toUpperCase(),
                vehicleType,
                planType,
                ticketNumber: 'OFFLINE'
            });

            setIsEntryModalOpen(false);
            setShowPrintConfirm(true);
            toast.warning('Guardado en Modo Offline. Se sincronizará al volver la conexión.');
            setIsSubmitting(false);
            return;
        }

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
                    planType: newSession.planType,
                    ticketNumber: newSession.ticketNumber
                }
            });

            setIsEntryModalOpen(false);
            fetchSessions();

            // Show print confirmation modal
            setPendingPrintSession(newSession);
            setShowPrintConfirm(true);
            toast.success('Vehículo ingresado');

            // Notify global usage banner to refresh
            window.dispatchEvent(new Event('usage:updated'));
        } catch (err: any) {
            if (err.response?.status === 409) {
                // Monthly Client Warning
                toast.warning(err.response.data.message, {
                    duration: 5000,
                    style: { border: '2px solid #FFC107' }
                });
            } else {
                toast.error(err.response?.data?.message || 'Error al registrar entrada');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmPrintEntry = () => {
        setShowPrintConfirm(false);
        if (pendingPrintSession) {
            setTimeout(() => handlePrintTicket(), 100);
        }
        setPendingPrintSession(null);
    };

    const handleCancelPrintEntry = () => {
        setShowPrintConfirm(false);
        setPendingPrintSession(null);
    };

    // --- Exit Logic ---

    const handleExitClick = async (plate: string) => {
        // Offline Handling
        if (!isOnline) {
            const session = sessions.find(s => s.plate === plate);

            if (session) {
                const { cost, durationMinutes, exitTime } = calculateOfflineCost(session, tariffs, settings);

                setPreviewData({
                    id: session.id, // Keep ID if available (likely numeric from server fetch)
                    plate: session.plate,
                    vehicleType: session.vehicleType,
                    planType: session.planType,
                    entryTime: session.entryTime,
                    exitTime: exitTime,
                    cost: cost,
                    durationMinutes: durationMinutes,
                    hourlyRate: 0, // Not critical for display usually
                    isOffline: true
                });
            } else {
                // Fallback if session not found in list (weird but safe)
                setPreviewData({
                    plate: plate,
                    cost: 0,
                    entryTime: new Date().toISOString(),
                    durationMinutes: 0,
                    isOffline: true
                });
            }
            return;
        }

        try {
            const response = await api.get(`/parking/preview/${plate}`);
            setPreviewData(response.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al obtener vista previa');
        }
    };

    const confirmExit = async (data: { paymentMethod: string, discount: number, discountReason: string, agreementId: string, redeem: boolean }) => {
        if (!previewData || isSubmitting) return;

        setIsSubmitting(true);
        const { paymentMethod, discount, discountReason, agreementId, redeem } = data;



        // Offline Handling
        if (!isOnline) {
            const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
            const currentLocation = JSON.parse(localStorage.getItem('currentLocation') || '{}');

            addOfflineItem({
                type: 'EXIT',
                payload: {
                    plate: previewData.plate,
                    paymentMethod,
                    discount: discount ? Number(discount) : 0,
                    discountReason,
                    agreementId: agreementId ? Number(agreementId) : undefined,
                    sessionId: previewData.id // Include if available, useful for backend
                },
                tenantId: currentTenant.id,
                locationId: currentLocation.id
            });

            setExitResult({
                plate: previewData.plate,
                cost: previewData.cost, // Use calculated cost
                durationMinutes: previewData.durationMinutes,
                entryTime: previewData.entryTime,
                exitTime: new Date().toISOString(),
                isOffline: true
            });

            setPreviewData(null);
            toast.warning('Salida guardada en Modo Offline.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await api.post('/parking/exit', {
                sessionId: previewData.id,
                plate: previewData.plate,
                paymentMethod,
                discount: discount ? Number(discount) : 0,
                discountReason,
                agreementId: agreementId && agreementId !== '' ? Number(agreementId) : undefined,
                redeem
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
                session: { ...exitData, duration }
            });

            setExitResult(exitData);
            setPreviewData(null);
            fetchSessions();

            toast.success('Salida registrada correctamente');

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al registrar salida');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReprintTicket = (session: ParkingSession) => {
        setPrintData({
            type: 'ticket',
            session: { ...session }
        });
        setTimeout(() => handlePrintTicket(), 100);
    };

    const handleReprintReceipt = (session: any) => {
        setPrintData({
            type: 'receipt',
            session: { ...session }
        });
        if (handlePrintReceipt) {
            setTimeout(() => handlePrintReceipt(), 100);
        }
    };

    const handleDeleteSession = async (sessionId: number | string, reason: string) => {
        // Handle Offline Deletion
        if (typeof sessionId === 'string') {
            if (window.confirm('¿Eliminar este registro offline pendiente?')) {
                removeOfflineItem(sessionId);
            }
            return;
        }

        if (!isOnline) {
            toast.error('No se puede eliminar en modo offline');
            return;
        }

        try {
            await api.post('/parking/cancel', { id: sessionId, reason });
            toast.success('Sesión eliminada correctamente');
            fetchSessions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al eliminar sesión');
        }
    };

    // --- Helper for List View ---

    const formattedOfflineSessions: ParkingSession[] = queue
        .filter(item => {
            if (item.type !== 'ENTRY') return false;
            // Filter by current location to avoid "Ghost Vehicles"
            const currentLocation = JSON.parse(localStorage.getItem('currentLocation') || '{}');
            return item.locationId === currentLocation.id;
        })
        .map(item => ({
            id: item.id,
            plate: item.payload?.plate || '???',
            vehicleType: item.payload?.vehicleType || 'CAR',
            entryTime: new Date(item.timestamp).toISOString(),
            planType: item.payload?.planType
        }));


    // Calculate pending exits to hide them from the list immediately
    const pendingExits = queue.filter(item => item.type === 'EXIT');
    const pendingExitPlates = new Set(pendingExits.map(item => item.payload?.plate));

    // Filter server sessions that have a pending exit
    const visibleServerSessions = sessions.filter(session => !pendingExitPlates.has(session.plate));

    const allSessions = [...formattedOfflineSessions, ...visibleServerSessions];

    const filteredSessions = allSessions.filter(session =>
        session.plate.includes(searchTerm.toUpperCase())
    );

    const getPlanLabel = (session: ParkingSession) => {
        const tariff = tariffs.find(t => t.vehicleType === session.vehicleType);
        if (!tariff) return 'Por Hora';

        if (tariff.pricingModel === 'TRADITIONAL') {
            return session.planType === 'DAY' ? 'Por Día' : 'Por Hora';
        } else if (tariff.pricingModel === 'MINUTE') {
            return 'Por Minuto';
        } else {
            return 'Por Bloques';
        }
    };

    return {
        // Data
        sessions,
        filteredSessions,
        loading,
        settings,
        tariffs,
        agreements,
        activeShift,

        // UI Controls
        searchTerm,
        setSearchTerm,
        isEntryModalOpen,
        setIsEntryModalOpen,
        isSubmitting,

        // Modals Data
        previewData,
        setPreviewData,
        exitResult,
        setExitResult,
        printData,

        // Print Entry Flow
        showPrintConfirm,
        pendingPrintSession,

        // Handlers
        handleOpenEntryModal,
        handleEntrySubmit,
        handleExitClick,
        confirmExit,
        handleReprintTicket,
        handleReprintReceipt,
        handleConfirmPrintEntry,
        handleCancelPrintEntry,
        getPlanLabel,
        handleDeleteSession
    };
};
