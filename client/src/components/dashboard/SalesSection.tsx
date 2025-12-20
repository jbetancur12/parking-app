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
            alert('Income registered!');
            if (onSaleAdded) onSaleAdded();
        } catch (error) {
            console.error(error);
            alert('Error registering income. Ensure shift is active.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center mb-4">
                <DollarSign className="text-green-600 mr-2" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Additional Income</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
                        placeholder="e.g. Soda, Oil, Tips"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
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
                    {loading ? 'Registering...' : 'Register Income'}
                </button>
            </form>
        </div>
    );
}
