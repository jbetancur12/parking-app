import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash, AlertTriangle, Save, X } from 'lucide-react';
import { productService, type Product } from '../services/product.service';

export const InventoryPage: React.FC = () => {
    // const { user } = useAuth(); // Unused
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [minStock, setMinStock] = useState('5');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setName(product.name);
            setPrice(product.price.toString());
            setStock(product.stock.toString());
            setMinStock(product.minStock.toString());
        } else {
            setEditingProduct(null);
            setName('');
            setPrice('');
            setStock('0');
            setMinStock('5');
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                name,
                price: Number(price),
                stock: Number(stock),
                minStock: Number(minStock)
            };

            if (editingProduct) {
                await productService.update(editingProduct.id, data);
            } else {
                await productService.create(data);
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            alert('Error al guardar producto');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro de eliminar este producto?')) return;
        try {
            await productService.delete(id);
            loadProducts();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    if (loading) return <div>Cargando inventario...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Package className="mr-2" /> Inventario de Productos
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    data-testid="btn-new-product"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
                >
                    <Plus size={18} className="mr-2" /> Nuevo Producto
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(p => (
                            <tr key={p.id} data-testid={`product-row-${p.name}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">${p.price.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-bold ${p.stock <= p.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                                        {p.stock}
                                        {p.stock <= p.minStock && (
                                            <AlertTriangle size={14} className="inline ml-1 text-red-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Activo
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No hay productos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
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
                                    onClick={() => setIsModalOpen(false)}
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
            )}
        </div>
    );
};
