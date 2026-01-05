import { useState, useEffect } from 'react';
import { expenseService, type Expense } from '../../services/expense.service';
import api from '../../services/api';

export const useExpensesPage = () => {
    // Data State
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');

    // UI State
    const [loading, setLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchActiveShift();
    }, []);

    // Fetch Expenses when shift loads
    useEffect(() => {
        if (activeShift) {
            fetchExpenses();
        }
    }, [activeShift]);

    const fetchActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        }
    };

    const fetchExpenses = async () => {
        if (!activeShift) return;
        try {
            const data = await expenseService.getAllByShift(activeShift.id);
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !activeShift) return;

        setLoading(true);
        try {
            await expenseService.create(activeShift.id, description, Number(amount), paymentMethod);
            setDescription('');
            setAmount('');
            setPaymentMethod('CASH');
            fetchExpenses();
        } catch (error) {
            alert('Error al registrar egreso');
        } finally {
            setLoading(false);
        }
    };

    return {
        // Data
        expenses,
        activeShift,

        // Form
        description, setDescription,
        amount, setAmount,
        paymentMethod, setPaymentMethod,

        // UI
        loading,

        // Handlers
        handleCreate
    };
};
