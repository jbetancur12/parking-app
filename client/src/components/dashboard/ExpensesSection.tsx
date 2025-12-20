import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { expenseService, type Expense } from '../../services/expense.service';

interface Props {
    shiftId: number;
}

export function ExpensesSection({ shiftId }: Props) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, [shiftId]);

    const fetchExpenses = async () => {
        try {
            const data = await expenseService.getAllByShift(shiftId);
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        setCreating(true);
        try {
            await expenseService.create(shiftId, description, Number(amount));
            setDescription('');
            setAmount('');
            fetchExpenses(); // Refresh list
        } catch (error) {
            alert('Failed to create expense');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Expenses (Egresos)</h2>
            </div>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-lg items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="e.g., Compra de Jabón"
                        required
                    />
                </div>
                <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="0.00"
                        min="0"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={creating}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 flex items-center disabled:opacity-50"
                >
                    <Plus size={16} className="mr-1" />
                    Record Expense
                </button>
            </form>

            {/* List */}
            {loading ? (
                <p className="text-gray-500">Loading expenses...</p>
            ) : expenses.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No expenses recorded for this shift.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="px-4 py-2 text-left">Time</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id} className="border-b">
                                    <td className="px-4 py-2 text-gray-500">
                                        {new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-2 font-medium">{expense.description}</td>
                                    <td className="px-4 py-2 text-right text-red-600 font-bold">
                                        - ${Number(expense.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
