import React from 'react';
import { Edit, Trash, AlertTriangle } from 'lucide-react';
import { type Product } from '../../services/product.service';

interface InventoryListProps {
    products: Product[];
    isAdmin: boolean;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ products, isAdmin, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {isAdmin ? 'Acciones' : ''}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map(p => (
                        <tr key={p.id} data-testid={`product-row-${p.name}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">${p.price.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-bold ${p.stock <= p.minStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-green-400'}`}>
                                    {p.stock}
                                    {p.stock <= p.minStock && (
                                        <AlertTriangle size={14} className="inline ml-1 text-red-500 dark:text-red-400" />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Activo
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {isAdmin && (
                                    <>
                                        <button onClick={() => onEdit(p)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            <Trash size={18} />
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                No hay productos registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
