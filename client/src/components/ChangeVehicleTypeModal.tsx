import { useState } from 'react';
import { X } from 'lucide-react';

interface ChangeVehicleTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newVehicleType: string) => void;
    currentVehicleType: string;
    sessionId: number | string;
    plate: string;
}

const vehicleTypes = [
    { value: 'CAR', label: 'Carro' },
    { value: 'MOTORCYCLE', label: 'Moto' },
    { value: 'OTHER', label: 'Otro' }
];

export default function ChangeVehicleTypeModal({
    isOpen,
    onClose,
    onConfirm,
    currentVehicleType,
    plate
}: ChangeVehicleTypeModalProps) {
    const [selectedType, setSelectedType] = useState(currentVehicleType);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedType === currentVehicleType) {
            return; // No change
        }
        onConfirm(selectedType);
        onClose();
    };

    const getVehicleTypeLabel = (type: string) => {
        return vehicleTypes.find(v => v.value === type)?.label || type;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-display font-bold text-brand-blue">
                        Cambiar Tipo de Vehículo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Placa: <span className="font-bold text-gray-900">{plate}</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            Tipo actual: <span className="font-bold text-gray-900">{getVehicleTypeLabel(currentVehicleType)}</span>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Seleccionar nuevo tipo:
                        </label>
                        <div className="space-y-2">
                            {vehicleTypes.map((type) => (
                                <label
                                    key={type.value}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedType === type.value
                                        ? 'border-brand-blue bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="vehicleType"
                                        value={type.value}
                                        checked={selectedType === type.value}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-4 h-4 text-brand-blue focus:ring-brand-blue"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                        {type.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedType === currentVehicleType}
                        className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-900 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar Cambio
                    </button>
                </div>
            </div>
        </div>
    );
}
