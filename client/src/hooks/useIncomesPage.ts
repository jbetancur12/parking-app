import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { saleService } from '../services/sale.service';
import { productService, type Product } from '../services/product.service';
import { settingService } from '../services/setting.service';
import api from '../services/api';

interface CartItem {
    product: Product;
    quantity: number;
}

export const useIncomesPage = (handlePrintReceipt: () => void) => {
    // Data State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);

    // Modes
    const [mode, setMode] = useState<'MANUAL' | 'POS'>('POS');

    // Manual Form
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [manualPaymentMethod, setManualPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');

    // POS Data
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [posPaymentMethod, setPosPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');

    // Print State
    const [printData, setPrintData] = useState<any>(null);
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);

    // Initialization
    useEffect(() => {
        fetchActiveShift();
        loadProducts();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (activeShift) {
            fetchTransactions();
        }
    }, [activeShift]);

    // Data Fetchers
    const fetchSettings = async () => {
        try {
            const data = await settingService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings', error);
        }
    };

    const fetchActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        }
    };

    const fetchTransactions = async () => {
        if (!activeShift) return;
        try {
            const data = await saleService.getAllByShift(activeShift.id);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions');
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products');
        }
    };

    // POS Logic
    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.warning(`Stock insuficiente de ${product.name}`);
                    return prev;
                }
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const calculateCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    // Printing Helpers
    const preparePrintData = (transaction: any, itemsOverride?: any[]) => {
        setPrintData({
            id: transaction.id,
            timestamp: transaction.timestamp || new Date().toISOString(),
            description: transaction.description,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod || 'CASH',
            items: itemsOverride || []
        });
        setShowPrintConfirm(true);
    };

    const handleConfirmPrint = () => {
        setShowPrintConfirm(false);
        setTimeout(() => handlePrintReceipt(), 100);
    };

    const handleReprint = (transaction: any) => {
        setPrintData({
            id: transaction.id,
            timestamp: transaction.timestamp,
            description: transaction.description,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod,
            items: []
        });
        setTimeout(() => handlePrintReceipt(), 100);
    };

    // Submit Handlers
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;
        setLoading(true);
        try {
            const response = await saleService.create(description, Number(amount), manualPaymentMethod);
            preparePrintData({
                id: response.id || 'NEW',
                timestamp: new Date().toISOString(),
                description,
                amount: Number(amount),
                paymentMethod: manualPaymentMethod
            });
            setDescription('');
            setAmount('');
            setManualPaymentMethod('CASH');
            toast.success('Ingreso registrado!');
            fetchTransactions();
        } catch (error) {
            toast.error('Error al registrar ingreso');
        } finally {
            setLoading(false);
        }
    };

    const handlePOSSubmit = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const total = calculateCartTotal();
            const itemsPayload = cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }));
            const itemsForPrint = cart.map(item => ({
                productName: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            }));

            const response = await saleService.create('Venta POS', total, posPaymentMethod, itemsPayload);

            setPrintData({
                id: response?.id || '???',
                timestamp: new Date().toISOString(),
                description: 'Venta POS',
                amount: total,
                paymentMethod: posPaymentMethod,
                items: itemsForPrint
            });
            setShowPrintConfirm(true);

            setCart([]);
            setPosPaymentMethod('CASH');
            toast.success('Venta registrada!');
            fetchTransactions();
            loadProducts();
        } catch (error: any) {
            toast.error('Error al registrar venta');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        activeShift,
        settings,
        mode, setMode,
        transactions,
        loading,

        // Manual Form
        description, setDescription,
        amount, setAmount,
        manualPaymentMethod, setManualPaymentMethod,

        // POS
        products,
        cart,
        addToCart,
        removeFromCart,
        posPaymentMethod, setPosPaymentMethod,
        calculateCartTotal,

        // Print
        printData,
        showPrintConfirm, setShowPrintConfirm,
        handleConfirmPrint,
        handleReprint,

        // Handlers
        handleManualSubmit,
        handlePOSSubmit
    };
};
