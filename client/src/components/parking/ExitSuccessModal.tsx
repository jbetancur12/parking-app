import React from 'react';
import { Printer } from 'lucide-react';

interface ExitSuccessModalProps {
    exitResult: any;
    onClose: () => void;
    onPrint: () => void;
}

export const ExitSuccessModal: React.FC<ExitSuccessModalProps> = ({
    exitResult,
    onClose,
    onPrint
}) => {
    // Escape key listener
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4 text-green-600">Salida Exitosa</h2>
                <div className="space-y-2 mb-6">
                    <p><strong>Placa:</strong> {exitResult.plate}</p>
                    <p><strong>Duración:</strong> {exitResult.durationMinutes} min</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">Total: ${exitResult.cost}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                >
                    Cerrar
                </button>
                <button
                    onClick={onPrint}
                    className="w-full mt-2 border border-gray-300 text-gray-600 py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                    <Printer size={16} />
                    Imprimir Recibo
                </button>
            </div>
        </div>
    );
};
