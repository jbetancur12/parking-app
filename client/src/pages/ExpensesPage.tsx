import React, { useState, useEffect } from 'react';
import { TrendingDown, Plus } from 'lucide-react';
import { expenseService, type Expense } from '../services/expense.service';
import api from '../services/api';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [activeShift, setActiveShift] = useState<any>(null);

    useEffect(() => {
        fetchActiveShift();
    }, []);

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

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar egresos.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingDown className="mr-2" /> Egresos (Gastos)
            </h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Registrar Nuevo Egreso</h2>
                <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                            placeholder="e.j. Jabón, Almuerzo"
                            required
                            name="description"
                            id="description"
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                            placeholder="0.00"
                            min="0"
                            required
                            name="amount"
                            id="amount"
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border bg-white"
                        >
                            <option value="CASH">Efectivo</option>
                            <option value="TRANSFER">Transferencia</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center h-10"
                    >
                        <Plus size={18} className="mr-2" />
                        Registrar
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Historial del Día (Turno Actual)</h3>
                </div>
                {expenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay egresos registrados en este turno.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenses.map(exp => (
                                <tr key={exp.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(exp.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {exp.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold text-right">
                                        - ${Number(exp.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
