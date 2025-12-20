import React, { useState, useEffect } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import { saleService } from '../services/sale.service';
import api from '../services/api';

export default function IncomesPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [activeShift, setActiveShift] = useState<any>(null);

    useEffect(() => {
        fetchActiveShift();
    }, []);

    useEffect(() => {
        if (activeShift) {
            fetchTransactions();
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

    const fetchTransactions = async () => {
        if (!activeShift) return;
        try {
            const data = await saleService.getAllByShift(activeShift.id);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        setLoading(true);
        try {
            await saleService.create(description, Number(amount));
            setDescription('');
            setAmount('');
            alert('Ingreso registrado!');
            fetchTransactions();
        } catch (error) {
            console.error(error);
            alert('Error. Asegúrese que el turno esté activo.');
        } finally {
            setLoading(false);
        }
    };

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar ingresos.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <DollarSign className="mr-2" /> Ingresos Adicionales
            </h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Registrar Nuevo Ingreso</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                            placeholder="e.j. Gaseosa, Aceite"
                            required
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                            placeholder="0.00"
                            min="0"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center h-10"
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
                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay ingresos registrados en este turno.</p>
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
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(t.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {t.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold text-right">
                                        + ${Number(t.amount).toLocaleString()}
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
