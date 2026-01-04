import React from 'react';
import { CurrencyInput } from '../common/CurrencyInput';
import { Save, X } from 'lucide-react';

interface InventoryFormProps {
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditing: boolean;
    name: string;
    setName: (val: string) => void;
    price: string;
    setPrice: (val: string) => void;
    stock: string;
    setStock: (val: string) => void;
    minStock: string;
    setMinStock: (val: string) => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
    onSubmit,
    onCancel,
    isEditing,
    name,
    setName,
    price,
    setPrice,
    stock,
    setStock,
    minStock,
    setMinStock
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={24} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            required
                            name="name"
                            id="name"
                            data-testid="input-product-name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio Venta</label>
                        <CurrencyInput
                            value={price}
                            onValueChange={setPrice}
                            className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            id="price"
                            name="price"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Actual</label>
                            <CurrencyInput
                                value={stock}
                                onValueChange={setStock}
                                className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                id="stock"
                                name="stock"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Mínimo</label>
                            <CurrencyInput
                                value={minStock}
                                onValueChange={setMinStock}
                                className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                id="minStock"
                                name="minStock"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="mr-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            data-testid="btn-save-product"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                        >
                            <Save size={18} className="mr-2" /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
