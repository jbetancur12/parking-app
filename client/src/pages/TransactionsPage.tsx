import { useEffect, useState } from 'react';
import { Receipt, Download, Filter } from 'lucide-react';
import api from '../services/api';
import { exportToExcel } from '../utils/excelExport';

interface Transaction {
    id: number;
    type: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    timestamp: string;
}

export default function TransactionsPage() {
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

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'PARKING_REVENUE': 'Parqueo',
            'MONTHLY_PAYMENT': 'Mensualidad',
            'WASH_SERVICE': 'Lavadero',
            'INCOME': 'Ingreso',
            'EXPENSE': 'Egreso'
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        if (type === 'EXPENSE') return 'bg-red-100 text-red-800';
        return 'bg-green-100 text-green-800';
    };

    const totals = {
        all: filteredTransactions.reduce((sum, t) => sum + (t.type === 'EXPENSE' ? -t.amount : t.amount), 0),
        cash: filteredTransactions.filter(t => t.paymentMethod === 'CASH').reduce((sum, t) => sum + (t.type === 'EXPENSE' ? -t.amount : t.amount), 0),
        transfer: filteredTransactions.filter(t => t.paymentMethod === 'TRANSFER').reduce((sum, t) => sum + (t.type === 'EXPENSE' ? -t.amount : t.amount), 0)
    };

    if (loading) return <div className="p-8">Cargando...</div>;

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    };

    const formatDescription = (desc: string) => {
        let formatted = desc
            .replace('Parking[HOUR]', 'Parqueo [Hora]')
            .replace('Parking[DAY]', 'Parqueo [Día]')
            .replace('WASH_SERVICE', 'Lavado')
            .replace('MONTHLY_PAYMENT', 'Mensualidad')
            .replace('DESC:', 'Obs:');

        // Regex to find duration in mins and convert to hh:mm:ss
        const durationMatch = formatted.match(/\((\d+)\s*mins?\)/);
        if (durationMatch) {
            const minutes = parseInt(durationMatch[1]);
            formatted = formatted.replace(durationMatch[0], `(${formatDuration(minutes)})`);
        }

        return formatted;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Receipt className="mr-3" /> Transacciones del Turno
                </h1>
                <button
                    onClick={handleExport}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Download size={18} />
                    Exportar a Excel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Filter size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Filtros:</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Transacción</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="ALL">Todos</option>
                            <option value="PARKING_REVENUE">Parqueo</option>
                            <option value="MONTHLY_PAYMENT">Mensualidad</option>
                            <option value="WASH_SERVICE">Lavadero</option>
                            <option value="INCOME">Ingreso Adicional</option>
                            <option value="EXPENSE">Egreso</option>
                        </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        >
                            <option value="ALL">Todos</option>
                            <option value="CASH">💵 Efectivo</option>
                            <option value="TRANSFER">🏦 Transferencia</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total General</p>
                    <p className="text-2xl font-bold text-blue-600">${totals.all.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">💵 Efectivo</p>
                    <p className="text-2xl font-bold text-green-600">${totals.cash.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">🏦 Transferencia</p>
                    <p className="text-2xl font-bold text-purple-600">${totals.transfer.toLocaleString()}</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método Pago</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                                        {getTypeLabel(transaction.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{formatDescription(transaction.description)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {transaction.paymentMethod ? (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${transaction.paymentMethod === 'CASH'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {transaction.paymentMethod === 'CASH' ? '💵 Efectivo' : '🏦 Transferencia'}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">N/A</span>
                                    )}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {transaction.type === 'EXPENSE' ? '-' : '+'}${transaction.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(transaction.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No hay transacciones que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
