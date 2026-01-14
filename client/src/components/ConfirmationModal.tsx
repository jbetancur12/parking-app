import React, { useEffect } from 'react';
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
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Escape') {
                onCancel();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const colors = {
        primary: {
            bg: 'bg-blue-600 hover:bg-blue-700',
            text: 'text-blue-600 dark:text-blue-400',
            icon: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600/50'
        },
        danger: {
            bg: 'bg-red-600 hover:bg-red-700',
            text: 'text-red-600 dark:text-red-400',
            icon: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-600/50'
        },
        warning: {
            bg: 'bg-amber-500 hover:bg-amber-600',
            text: 'text-amber-600 dark:text-amber-400',
            icon: 'text-amber-500 dark:text-amber-400',
            border: 'border-amber-200 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-600/50'
        }
    };

    const color = colors[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden transform transition-all scale-100 border dark:border-gray-700">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-full ${color.border}`}>
                            <AlertTriangle className={`w-6 h-6 ${color.icon}`} />
                        </div>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
