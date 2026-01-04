import React from 'react';
import { Package, Plus } from 'lucide-react';
import { useInventoryPage } from '../hooks/useInventoryPage';
import { InventoryList } from '../components/inventory/InventoryList';
import { InventoryForm } from '../components/inventory/InventoryForm';

export const InventoryPage: React.FC = () => {
    const {
        // State
        products,
        loading,
        isModalOpen, setIsModalOpen,
        editingProduct,
        isAdmin,

        // Form
        name, setName,
        price, setPrice,
        stock, setStock,
        minStock, setMinStock,

        // Handlers
        handleOpenModal,
        handleSave,
        handleDelete
    } = useInventoryPage();

    if (loading) return <div>Cargando inventario...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <Package className="mr-2" /> Inventario de Productos
                </h1>
                {isAdmin && (
                    <button
                        onClick={() => handleOpenModal()}
                        data-testid="btn-new-product"
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
                    >
                        <Plus size={18} className="mr-2" /> Nuevo Producto
                    </button>
                )}
            </div>

            <InventoryList
                products={products}
                isAdmin={isAdmin}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <InventoryForm
                    onSubmit={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isEditing={!!editingProduct}
                    name={name}
                    setName={setName}
                    price={price}
                    setPrice={setPrice}
                    stock={stock}
                    setStock={setStock}
                    minStock={minStock}
                    setMinStock={setMinStock}
                />
            )}
        </div>
    );
};
