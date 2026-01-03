import { useState, useEffect } from 'react';
import { washService, type WashServiceType, type WashEntry } from '../services/wash.service';
import api from '../services/api';

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !plate || !activeShift) return;

        setLoading(true);
        try {
            await washService.createEntry(activeShift.id, {
                plate,
                serviceTypeId: Number(selectedType),
                operatorName: operator,
                price: price ? Number(price) : undefined,
                paymentMethod
            });
            setMessage('Lavado registrado!');

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
        loadTypes
    };
};
