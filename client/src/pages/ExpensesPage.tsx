// React import not needed with new JSX transform
import { TrendingDown } from 'lucide-react';
import { useExpensesPage } from '../hooks/useExpensesPage';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { ExpenseList } from '../components/expenses/ExpenseList';

export default function ExpensesPage() {
    const {
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
    } = useExpensesPage();

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar egresos.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-display font-bold text-brand-blue mb-6 flex items-center">
                <TrendingDown className="mr-2" /> Egresos (Gastos)
            </h1>

            {/* Create Form */}
            <ExpenseForm
                onSubmit={handleCreate}
                loading={loading}
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
            />

            {/* List */}
            <ExpenseList expenses={expenses} />
        </div>
    );
}
