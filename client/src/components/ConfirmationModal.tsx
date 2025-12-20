import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'primary' | 'danger' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    type = 'primary'
}) => {
    if (!isOpen) return null;

    const colors = {
        primary: {
            bg: 'bg-blue-600 hover:bg-blue-700',
            text: 'text-blue-600',
            icon: 'text-blue-600',
            border: 'border-blue-200 bg-blue-50'
        },
        danger: {
            bg: 'bg-red-600 hover:bg-red-700',
            text: 'text-red-600',
            icon: 'text-red-600',
            border: 'border-red-200 bg-red-50'
        },
        warning: {
            bg: 'bg-amber-500 hover:bg-amber-600',
            text: 'text-amber-600',
            icon: 'text-amber-500',
            border: 'border-amber-200 bg-amber-50'
        }
    };

    const color = colors[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-full ${color.border}`}>
                            <AlertTriangle className={`w-6 h-6 ${color.icon}`} />
                        </div>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors ${color.bg}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
