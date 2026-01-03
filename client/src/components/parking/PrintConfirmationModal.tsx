import React from 'react';
import { type Tariff } from '../../services/tariff.service';

interface PrintConfirmationModalProps {
    session: any;
    tariffs: Tariff[];
    onConfirm: () => void;
    onCancel: () => void;
}

export const PrintConfirmationModal: React.FC<PrintConfirmationModalProps> = ({
    session,
    tariffs,
    onConfirm,
    onCancel
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4 text-green-600">✅ Vehículo Registrado</h2>
                <div className="space-y-2 mb-6">
                    <p><strong>Placa:</strong> {session.plate}</p>
                    <p><strong>Tipo:</strong> {session.vehicleType === 'CAR' ? 'Carro' : 'Moto'}</p>
                    <p><strong>Plan:</strong> {(() => {
                        const tariff = tariffs.find(t => t.vehicleType === session.vehicleType);
                        if (!tariff) return 'Por Hora';
                        if (tariff.pricingModel === 'TRADITIONAL') {
                            return session.planType === 'DAY' ? 'Por Día' : 'Por Hora';
                        } else if (tariff.pricingModel === 'MINUTE') {
                            return 'Por Minuto';
                        } else {
                            return 'Por Bloques';
                        }
                    })()}</p>
                </div>
                <p className="text-gray-600 mb-6">¿Desea imprimir el ticket de entrada?</p>
                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
                    >
                        No, gracias
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                    >
                        🖨️ Sí, Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};
