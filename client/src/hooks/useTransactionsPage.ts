import { useState, useEffect } from 'react';
import api from '../services/api';
import { exportToExcel } from '../utils/excelExport';

export interface Transaction {
    id: number;
    type: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    timestamp: string;
}

// Helpers
export const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        'PARKING_REVENUE': 'Parqueo',
        'MONTHLY_PAYMENT': 'Mensualidad',
        'WASH_SERVICE': 'Lavadero',
        'INCOME': 'Ingreso',
        'EXPENSE': 'Egreso'
    };
    return labels[type] || type;
};

export const getTypeColor = (type: string) => {
    if (type === 'EXPENSE') return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
};

export const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDescription = (desc: string) => {
    let formatted = desc
        .replace('Parking[HOUR]', 'Parqueo[HORA]')
        .replace('Parking[DAY]', 'Parqueo[DÍA]')
        .replace('Nova Mensualidad', 'Nueva Mensualidad')
        .replace('New Monthly', 'Nueva Mensualidad')
        .replace('WASH_SERVICE', 'Lavado')
        .replace('MONTHLY_PAYMENT', 'Mensualidad')
        .replace('DESC:', 'Obs:');

    const durationMatch = formatted.match(/\((\d+)\s*mins?\)/);
    if (durationMatch) {
        const minutes = parseInt(durationMatch[1]);
        const formattedTime = formatDuration(minutes);
        formatted = formatted.replace(durationMatch[0], `(${formattedTime})`);
    }

    return formatted;
};

export const useTransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterPayment, setFilterPayment] = useState<string>('ALL');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const shiftRes = await api.get('/shifts/current');
            if (shiftRes.data) {
                const transRes = await api.get(`/transactions/shift/${shiftRes.data.id}`);
                setTransactions(transRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const typeMatch = filterType === 'ALL' || t.type === filterType;
        const paymentMatch = filterPayment === 'ALL' || t.paymentMethod === filterPayment;
        return typeMatch && paymentMatch;
    });

    const totals = {
        all: filteredTransactions.reduce((sum, t) => sum + (t.type === 'EXPENSE' ? -t.amount : t.amount), 0),
        cash: filteredTransactions.filter(t => t.paymentMethod === 'CASH').reduce((sum, t) => sum + (t.type === 'EXPENSE' ? -t.amount : t.amount), 0),
        transfer: filteredTransactions.filter(t => t.paymentMethod === 'TRANSFER').reduce((sum, t) => sum + (t.type === 'EXPENSE' ? -t.amount : t.amount), 0)
    };

    const handleExport = () => {
        const exportData = filteredTransactions.map(t => ({
            'Tipo': getTypeLabel(t.type),
            'Descripción': t.description,
            'Monto': t.amount,
            'Método de Pago': t.paymentMethod ? (t.paymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia') : 'N/A',
            'Fecha/Hora': new Date(t.timestamp).toLocaleString()
        }));

        const filename = `Transacciones_${new Date().toISOString().split('T')[0]}`;
        exportToExcel(exportData, filename, 'Transacciones');
    };

    return {
        loading,
        transactions,
        filteredTransactions,
        filterType,
        setFilterType,
        filterPayment,
        setFilterPayment,
        totals,
        handleExport
    };
};
