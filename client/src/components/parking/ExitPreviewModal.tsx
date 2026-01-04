import React from 'react';
import type { Tariff } from '../../services/tariff.service';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyInput } from '../common/CurrencyInput';
import { useExitCalculations } from '../../hooks/useExitCalculations';

interface ExitPreviewModalProps {
    previewData: any;
    agreements: any[];
    tariffs: Tariff[];
    onCancel: () => void;
    onConfirm: (data: { paymentMethod: 'CASH' | 'TRANSFER', discount: number, discountReason: string, agreementId: string, redeem: boolean }) => void;
    isSubmitting: boolean;
}

export const ExitPreviewModal: React.FC<ExitPreviewModalProps> = ({
    previewData,
    agreements,
    tariffs,
    onCancel,
    onConfirm,
    isSubmitting
}) => {
    const {
        paymentMethod,
        setPaymentMethod,
        discount,
        discountReason,
        selectedAgreementId,
        redeem,
        cashReceived,
        setCashReceived,
        getPlanLabel,
        calculateTotal,
        calculateChange,
        getAppliedDiscountText,
        handleRedeemToggle,
        handleAgreementChange
    } = useExitCalculations({ previewData, agreements, tariffs });

    const handleConfirm = () => {
        onConfirm({
            paymentMethod,
            discount: discount ? Number(discount) : 0,
            discountReason,
            agreementId: selectedAgreementId,
            redeem
        });
    };

    const totalInfo = calculateTotal();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm shadow-xl border dark:border-gray-700 transition-colors">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Confirmar Salida</h2>
                <div className="space-y-3 mb-6">
                    <p className="text-lg text-gray-900 dark:text-gray-200"><strong>Placa:</strong> {previewData.plate}</p>
                    <p className="text-lg text-gray-900 dark:text-gray-200"><strong>Plan:</strong> {getPlanLabel()}</p>
                    <p className="text-lg text-gray-900 dark:text-gray-200"><strong>Duración:</strong> {Math.floor(previewData.durationMinutes / 60)}h {previewData.durationMinutes % 60}m</p>

                    {/* Loyalty Badge */}
                    {previewData.loyalty && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mt-2">
                            <h3 className="font-bold text-purple-800 text-sm flex items-center">
                                <span className="mr-2">🎁</span> Puntos Fidelización
                            </h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-purple-700">
                                    {previewData.loyalty.points} / {previewData.loyalty.target} Visitas
                                </span>
                                {previewData.canRedeem && (
                                    <button
                                        onClick={handleRedeemToggle}
                                        className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${redeem
                                            ? 'bg-green-600 text-white shadow-inner'
                                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                                            }`}
                                    >
                                        {redeem ? '✓ CANJEADO' : '🌟 CANJEAR'}
                                    </button>
                                )}
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                                <div
                                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (previewData.loyalty.points / previewData.loyalty.target) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Payment Method Selector */}
                    <div className="border-t dark:border-gray-700 pt-3 mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CASH')}
                                className={`py-2 text-sm rounded-md border ${paymentMethod === 'CASH'
                                    ? 'bg-green-50 dark:bg-green-900/40 border-green-500 text-green-700 dark:text-green-300 font-semibold shadow-sm'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                            >
                                💵 Efectivo
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('TRANSFER')}
                                className={`py-2 text-sm rounded-md border ${paymentMethod === 'TRANSFER'
                                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                            >
                                🏦 Transferencia
                            </button>
                        </div>
                    </div>

                    {/* Agreements Selector */}
                    {agreements.length > 0 && (
                        <div className="border-t dark:border-gray-700 pt-3 mt-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Convenio / Descuento Predefinido</label>
                            <select
                                value={selectedAgreementId}
                                onChange={(e) => handleAgreementChange(e.target.value)}
                                className="w-full border rounded-md px-2 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="">-- Seleccionar Convenio --</option>
                                {agreements.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.type === 'FREE_HOURS' ? `${a.value}h Gratis` : a.type === 'PERCENTAGE' ? `${a.value}%` : formatCurrency(a.value)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="border-t dark:border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(previewData.cost)}</span>
                        </div>
                        {discount && Number(discount) > 0 && (
                            <div className="flex justify-between text-sm text-red-500 mb-1">
                                <span>Descuento:</span>
                                <span>-{formatCurrency(Number(discount))}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700 dark:text-gray-200">Total a Pagar</span>
                            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {totalInfo.text}
                            </span>
                        </div>

                        {/* Change Calculator for Cash */}
                        {paymentMethod === 'CASH' && (
                            <div className="mt-4 border-t dark:border-gray-700 pt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Dinero Recibido:</label>
                                    <CurrencyInput
                                        value={cashReceived}
                                        onValueChange={setCashReceived}
                                        className="w-32 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-right font-medium text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="$"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Devuelta:</span>
                                    <span className={`text-xl font-bold ${Number(cashReceived) >= totalInfo.total
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {calculateChange()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Visual breakdown of applied discount */}
                    {(selectedAgreementId || (discount && Number(discount) > 0)) && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-800">
                            <span className="font-bold">Descuento aplicado: </span>
                            {getAppliedDiscountText()}
                        </div>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                        data-testid="btn-cancel-exit"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={`flex-1 bg-brand-yellow text-brand-blue font-bold py-2 rounded hover:bg-yellow-400 shadow-sm transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="btn-confirm-exit"
                    >
                        {isSubmitting ? 'Procesando...' : 'Confirmar Salida'}
                    </button>
                </div>
            </div>
        </div>
    );
};
