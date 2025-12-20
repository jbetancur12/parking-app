import { useState, useEffect } from 'react';
import { brandService, type Brand } from '../services/brand.service';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            const data = await brandService.getAll();
            setBrands(data);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await brandService.create(name.trim());
            setName('');
            loadBrands();
        } catch (error) {
            alert('Failed to create brand');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await brandService.delete(id);
            loadBrands();
        } catch (error) {
            alert('Failed to delete brand');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Tag className="mr-2" /> Vehicle Brands
            </h1>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="mb-8 flex gap-4 max-w-md">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 border rounded px-4 py-2"
                    placeholder="New Brand Name (e.g. BMW)"
                    required
                />
                <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Add
                </button>
            </form>

            {/* List */}
            {loading ? (
                <p>Loading...</p>
            ) : brands.length === 0 ? (
                <p className="text-gray-500">No brands configured.</p>
            ) : (
                <div className="bg-white rounded-lg shadow max-w-2xl">
                    <ul className="divide-y">
                        {brands.map(brand => (
                            <li key={brand.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <span className="font-medium text-gray-700">{brand.name}</span>
                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
