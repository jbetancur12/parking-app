
import React from 'react';
import type { Agreement } from '../../hooks/useAgreementsPage';

interface AgreementFormProps {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    name: string;
    setName: (value: string) => void;
    type: Agreement['type'];
    setType: (value: Agreement['type']) => void;
    value: string;
    setValue: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({
    onSubmit,
    onCancel,
    isSubmitting,
    name,
    setName,
    type,
    setType,
    value,
    setValue,
    description,
    setDescription
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Crear Nuevo Convenio</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="Ej. Restaurante X"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Beneficio</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as Agreement['type'])}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="PERCENTAGE">Porcentaje de Descuento</option>
                            <option value="FREE_HOURS">Horas Gratis</option>
                            <option value="FLAT_DISCOUNT">Descuento Fijo ($)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {type === 'PERCENTAGE' ? 'Porcentaje (%)' : type === 'FREE_HOURS' ? 'Cantidad de Horas' : 'Monto ($)'}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="0"
                            min="0"
                            step={type === 'PERCENTAGE' ? '1' : '0.01'}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Creando...' : 'Crear Convenio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
