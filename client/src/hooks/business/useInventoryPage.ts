import { useState, useEffect } from 'react';
import { productService, type Product } from '../services/product.service';
import { useAuth } from '../context/AuthContext';

export const useInventoryPage = () => {
    const { user } = useAuth();
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

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER';

    return {
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
    };
};
