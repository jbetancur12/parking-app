import { useState, useEffect } from 'react';
import { washService, type WashServiceType, type WashEntry } from '../../services/wash.service';
import api from '../../services/api';

export const useWashPage = () => {
    // Data State
    const [types, setTypes] = useState<WashServiceType[]>([]);
    const [entries, setEntries] = useState<WashEntry[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);

    // Form State
    const [plate, setPlate] = useState('');
    const [selectedType, setSelectedType] = useState<number | ''>('');
    const [price, setPrice] = useState('');
    const [operator, setOperator] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    // Print State
    const [printData, setPrintData] = useState<any>(null);
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchActiveShift();
        loadTypes();
    }, []);

    // Fetch History when shift loads
    useEffect(() => {
        if (activeShift) {
            fetchHistory();
        }
    }, [activeShift]);

    // Price auto-fill
    useEffect(() => {
        if (selectedType) {
            const type = types.find(t => t.id === selectedType);
            if (type) {
                setPrice(type.price.toString());
            }
        } else {
            setPrice('');
        }
    }, [selectedType, types]);

    const fetchActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        }
    };

    const loadTypes = async () => {
        try {
            let data = await washService.getTypes();
            if (data.length === 0) {
                await washService.seed();
                data = await washService.getTypes();
            }
            setTypes(data);
        } catch (error) {
            console.error('Failed to load wash types');
        }
    };

    const fetchHistory = async () => {
        if (!activeShift) return;
        try {
            const data = await washService.getAllByShift(activeShift.id);
            setEntries(data);
        } catch (error) {
            console.error('Failed to load history');
        }
    };

    // Printing Helpers
    const preparePrintData = (washEntry: any, serviceName: string, paymentMethod: string = 'CASH') => {
        setPrintData({
            id: washEntry.id,
            timestamp: washEntry.createdAt || new Date().toISOString(),
            description: `Lavado: ${serviceName}`,
            amount: Number(washEntry.cost),
            paymentMethod: paymentMethod,
            receiptNumber: washEntry.receiptNumber,
            items: [{
                productName: serviceName,
                quantity: 1,
                price: Number(washEntry.cost)
            }]
        });
        setShowPrintConfirm(true);
    };

    const handleConfirmPrint = (triggerPrint: () => void) => {
        setShowPrintConfirm(false);
        setTimeout(() => triggerPrint(), 100);
    };

    const handleReprint = (entry: WashEntry) => {
        const serviceName = (entry as any).serviceType?.name || 'Lavado';
        // Now we have paymentMethod on the entry!
        preparePrintData(entry, serviceName, entry.paymentMethod || 'CASH');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !plate || !activeShift) return;

        setLoading(true);
        try {
            const data = await washService.createEntry(activeShift.id, {
                plate,
                serviceTypeId: Number(selectedType),
                operatorName: operator,
                price: price ? Number(price) : undefined,
                paymentMethod
            });
            setMessage('Lavado registrado!');

            // Prepare for print
            const serviceTypeName = types.find(t => t.id === Number(selectedType))?.name || 'Lavado';
            preparePrintData(data, serviceTypeName, paymentMethod);

            // Reset Form Logic
            setPlate('');
            setSelectedType('');
            setOperator('');
            setPaymentMethod('CASH');

            setTimeout(() => setMessage(''), 3000);
            fetchHistory();
        } catch (error) {
            alert('Error al registrar lavado');
        } finally {
            setLoading(false);
        }
    };

    return {
        // Data
        types,
        entries,
        activeShift,

        // Form
        plate, setPlate,
        selectedType, setSelectedType,
        price, setPrice,
        operator, setOperator,
        paymentMethod, setPaymentMethod,

        // UI
        loading,
        message,
        modalOpen, setModalOpen,

        // Handlers
        handleCreate,
        loadTypes,

        // Print
        printData,
        showPrintConfirm,
        setShowPrintConfirm,
        handleConfirmPrint,
        handleReprint
    };
};
