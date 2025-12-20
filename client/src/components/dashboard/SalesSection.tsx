import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { saleService } from '../../services/sale.service';

interface Props {
    onSaleAdded?: () => void;
}

export default function SalesSection({ onSaleAdded }: Props) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        setLoading(true);
        try {
            await saleService.create(description, Number(amount));
            setDescription('');
            setAmount('');
            alert('Ingreso registrado!');
            if (onSaleAdded) onSaleAdded();
        } catch (error) {
            console.error(error);
            alert('Error. Asegúrese que el turno esté activo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center mb-4">
                <DollarSign className="text-green-600 mr-2" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Ingresos Adicionales</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                        placeholder="e.j. Gaseosa, Aceite"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                        placeholder="0.00"
                        min="0"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Registrando...' : 'Registrar Ingreso'}
                </button>
            </form>
        </div>
    );
}
