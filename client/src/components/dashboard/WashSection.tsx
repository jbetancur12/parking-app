import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { washService, type WashServiceType } from '../../services/wash.service';

interface Props {
    shiftId: number;
}

export function WashSection({ shiftId }: Props) {
    const [types, setTypes] = useState<WashServiceType[]>([]);
    const [plate, setPlate] = useState('');
    const [selectedType, setSelectedType] = useState<number | ''>('');
    const [operator, setOperator] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadTypes();
    }, []);

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !plate) return;

        setLoading(true);
        try {
            await washService.createEntry(shiftId, {
                plate,
                serviceTypeId: Number(selectedType),
                operatorName: operator
            });
            setMessage('Lavado registrado!');
            setPlate('');
            setSelectedType('');
            setOperator('');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Error al registrar lavado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Car className="mr-2" /> Lavadero
                </h2>
            </div>

            {message && (
                <div className="mb-4 bg-green-100 text-green-700 p-2 rounded text-sm">
                    {message}
                </div>
            )}

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Placa</label>
                    <input
                        type="text"
                        value={plate}
                        onChange={e => setPlate(e.target.value.toUpperCase())}
                        className="w-full border rounded px-3 py-2 text-sm uppercase"
                        placeholder="ABC-123"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Servicio</label>
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(Number(e.target.value))}
                        className="w-full border rounded px-3 py-2 text-sm"
                        required
                    >
                        <option value="">Seleccione Servicio...</option>
                        {types.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name} - ${t.price}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Operario (Opcional)</label>
                    <input
                        type="text"
                        value={operator}
                        onChange={e => setOperator(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Nombre"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
                >
                    Registrar Lavado
                </button>
            </form>
        </div>
    );
}
