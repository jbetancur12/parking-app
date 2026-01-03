import React from 'react';
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onCancel}><X size={24} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2"
                            required
                            name="name"
                            id="name"
                            data-testid="input-product-name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Precio Venta</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2"
                            required
                            name="price"
                            id="price"
                            data-testid="input-product-price"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Actual</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                className="mt-1 block w-full border rounded-md px-3 py-2"
                                required
                                name="stock"
                                id="stock"
                                data-testid="input-product-stock"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                            <input
                                type="number"
                                value={minStock}
                                onChange={e => setMinStock(e.target.value)}
                                className="mt-1 block w-full border rounded-md px-3 py-2"
                                required
                                name="minStock"
                                id="minStock"
                                data-testid="input-product-min-stock"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="mr-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
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
