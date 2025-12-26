import React, { useState, useEffect } from 'react';
import { Car, Plus } from 'lucide-react';
import { washService, type WashServiceType, type WashEntry } from '../services/wash.service';
import api from '../services/api';

export default function WashPage() {
    const [types, setTypes] = useState<WashServiceType[]>([]);
    const [entries, setEntries] = useState<WashEntry[]>([]);
    const [plate, setPlate] = useState('');
    const [selectedType, setSelectedType] = useState<number | ''>('');
    const [price, setPrice] = useState('');
    const [operator, setOperator] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeShift, setActiveShift] = useState<any>(null);

    useEffect(() => {
        fetchActiveShift();
        loadTypes();
    }, []);

    useEffect(() => {
        if (activeShift) {
            fetchHistory();
        }
    }, [activeShift]);

    useEffect(() => {
        if (selectedType) {
            const type = types.find(t => t.id === selectedType);
            if (type) {
                setPrice(type.price.toString());
            }
        } else {
            setPrice('');
        }
    }, [selectedType, types]);

    const fetchActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        }
    };

    const loadTypes = async () => {
        try {
            let data = await washService.getTypes();
            if (data.length === 0) {
                await washService.seed();
                data = await washService.getTypes();
            }
            setTypes(data);
        } catch (error) {
            console.error('Failed to load wash types');
        }
    };

    const fetchHistory = async () => {
        if (!activeShift) return;
        try {
            const data = await washService.getAllByShift(activeShift.id);
            setEntries(data);
        } catch (error) {
            console.error('Failed to load history');
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !plate || !activeShift) return;

        setLoading(true);
        try {
            await washService.createEntry(activeShift.id, {
                plate,
                serviceTypeId: Number(selectedType),
                operatorName: operator,
                price: price ? Number(price) : undefined,
                paymentMethod
            });
            setMessage('Lavado registrado!');
            setPlate('');
            setSelectedType('');
            setOperator('');
            setPaymentMethod('CASH');
            setTimeout(() => setMessage(''), 3000);
            fetchHistory();
        } catch (error) {
            alert('Error al registrar lavado');
        } finally {
            setLoading(false);
        }
    };

    if (!activeShift) {
        return <div className="p-8 text-center text-gray-500">No hay un turno activo. Inicie turno en Inicio para registrar servicios.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-display font-bold text-brand-blue mb-6 flex items-center">
                <Car className="mr-2" /> Lavadero de Autos
            </h1>

            {message && (
                <div className="mb-4 bg-brand-green/10 text-brand-green p-3 rounded-lg text-sm text-center font-bold border border-brand-green/20">
                    {message}
                </div>
            )}

            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-l-4 border-brand-blue">
                <h2 className="text-lg font-display font-bold mb-4 text-brand-blue">Nuevo Servicio</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                        <input
                            type="text"
                            value={plate}
                            onChange={e => setPlate(e.target.value.toUpperCase())}
                            className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow"
                            placeholder="ABC-123"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Servicio</label>
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(Number(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow"
                            required
                        >
                            <option value="">Seleccione Servicio...</option>
                            {types.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name} - ${t.price} (Sugerido)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Precio (Opcional)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none font-semibold text-gray-700 transition-shadow"
                            placeholder="Sugerido..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Operario (Opcional)</label>
                        <input
                            type="text"
                            value={operator}
                            onChange={e => setOperator(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow"
                            placeholder="Nombre"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Pago</label>
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value as 'CASH' | 'TRANSFER')}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white transition-shadow"
                        >
                            <option value="CASH">Efectivo</option>
                            <option value="TRANSFER">Transf.</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 shadow-md flex items-center justify-center h-10 w-full md:w-auto md:col-start-6 transform transition-transform active:scale-95"
                    >
                        <Plus size={18} className="mr-2" />
                        Registrar
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 bg-brand-blue/5">
                    <h3 className="text-lg font-display font-bold text-gray-800">Historial del Día (Turno Actual)</h3>
                </div>
                {entries.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 font-sans">No hay lavados registrados en este turno.</p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Placa</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Servicio</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Operario</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {entries.map(entry => (
                                        <tr key={entry.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(entry.createdAt).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {entry.plate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {(entry as any).serviceType?.name || 'Lavado'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {entry.operatorName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-800">
                                                ${Number(entry.cost).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="md:hidden">
                            {entries.map(entry => (
                                <div key={entry.id} className="p-4 border-b border-gray-100 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-display font-bold text-lg text-gray-900">{entry.plate}</span>
                                            <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{(entry as any).serviceType?.name || 'Lavado'}</p>
                                        <p className="text-xs text-gray-400 mt-1">Op: {entry.operatorName || '-'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-brand-green text-lg">${Number(entry.cost).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
