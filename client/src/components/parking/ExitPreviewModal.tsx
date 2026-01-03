import React, { useState } from 'react';
import { type Tariff } from '../../services/tariff.service';

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
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [discount, setDiscount] = useState('');
    const [discountReason, setDiscountReason] = useState('');
    const [selectedAgreementId, setSelectedAgreementId] = useState('');
    const [redeem, setRedeem] = useState(false);
    const [cashReceived, setCashReceived] = useState('');

    const handleConfirm = () => {
        onConfirm({
            paymentMethod,
            discount: discount ? Number(discount) : 0,
            discountReason,
            agreementId: selectedAgreementId,
            redeem
        });
    };

    const getPlanLabel = () => {
        const tariff = tariffs.find(t => t.vehicleType === previewData.vehicleType);
        if (!tariff) return 'Por Hora';
        if (tariff.pricingModel === 'TRADITIONAL') {
            return previewData.planType === 'DAY' ? 'Por Día' : 'Por Hora';
        } else if (tariff.pricingModel === 'MINUTE') {
            return 'Por Minuto';
        } else {
            return 'Por Bloques';
        }
    };

    const calculateTotal = () => {
        const originalCost = previewData.cost;
        // 1. Check for Redemption First (Highest Priority)
        if (redeem && previewData.loyalty) {
            if (previewData.loyalty.rewardType === 'HOURS') {
                const hourlyRate = previewData.hourlyRate || 0;
                const discountAmount = hourlyRate * (previewData.loyalty.rewardHours || 0);
                const finalVal = Math.max(0, originalCost - discountAmount);
                return { total: finalVal, text: `$${finalVal.toLocaleString()} (Desc. ${previewData.loyalty.rewardHours}h)` };
            }
            return { total: 0, text: `$0 (Canje Total)` };
        }

        let finalDiscount = 0;

        if (selectedAgreementId) {
            const agreement = agreements.find(a => a.id.toString() === selectedAgreementId);
            if (agreement) {
                if (agreement.type === 'FREE_HOURS') {
                    const hourlyRate = previewData.hourlyRate || 0;
                    finalDiscount = hourlyRate * agreement.value;
                } else if (agreement.type === 'PERCENTAGE') {
                    finalDiscount = (originalCost * agreement.value) / 100;
                } else if (agreement.type === 'FLAT_DISCOUNT') {
                    finalDiscount = agreement.value;
                }
            }
        } else if (discount) {
            finalDiscount = Number(discount) || 0;
        }

        // Cap discount to cost
        finalDiscount = Math.min(originalCost, finalDiscount);
        const finalTotal = Math.max(0, originalCost - finalDiscount);

        return { total: finalTotal, text: `$${finalTotal.toLocaleString()}` };
    };

    const totalInfo = calculateTotal();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmar Salida</h2>
                <div className="space-y-3 mb-6">
                    <p className="text-lg"><strong>Placa:</strong> {previewData.plate}</p>
                    <p className="text-lg"><strong>Plan:</strong> {getPlanLabel()}</p>
                    <p className="text-lg"><strong>Duración:</strong> {Math.floor(previewData.durationMinutes / 60)}h {previewData.durationMinutes % 60}m</p>

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
                                        onClick={() => {
                                            setRedeem(!redeem);
                                            if (!redeem) {
                                                // Disable other discounts if redeeming
                                                setDiscount('');
                                                setSelectedAgreementId('');
                                            }
                                        }}
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
                    <div className="border-t pt-3 mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CASH')}
                                className={`py-2 text-sm rounded-md border ${paymentMethod === 'CASH'
                                    ? 'bg-green-50 border-green-500 text-green-700 font-semibold'
                                    : 'bg-white border-gray-300 text-gray-700'
                                    }`}
                            >
                                💵 Efectivo
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('TRANSFER')}
                                className={`py-2 text-sm rounded-md border ${paymentMethod === 'TRANSFER'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                                    : 'bg-white border-gray-300 text-gray-700'
                                    }`}
                            >
                                🏦 Transferencia
                            </button>
                        </div>
                    </div>

                    {/* Agreements Selector */}
                    {agreements.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Convenio / Descuento Predefinido</label>
                            <select
                                value={selectedAgreementId}
                                onChange={(e) => {
                                    setSelectedAgreementId(e.target.value);
                                    if (e.target.value) {
                                        setDiscount('');
                                        setDiscountReason('');
                                    }
                                }}
                                className="w-full border rounded-md px-2 py-2"
                            >
                                <option value="">-- Seleccionar Convenio --</option>
                                {agreements.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.type === 'FREE_HOURS' ? `${a.value}h Gratis` : a.type === 'PERCENTAGE' ? `${a.value}%` : `$${a.value}`})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Subtotal:</span>
                            <span>${previewData.cost}</span>
                        </div>
                        {discount && Number(discount) > 0 && (
                            <div className="flex justify-between text-sm text-red-500 mb-1">
                                <span>Descuento:</span>
                                <span>-${discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Total a Pagar</span>
                            <span className="text-3xl font-bold text-green-600">
                                {totalInfo.text}
                            </span>
                        </div>

                        {/* Change Calculator for Cash */}
                        {paymentMethod === 'CASH' && (
                            <div className="mt-4 border-t pt-3 bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700">Dinero Recibido:</label>
                                    <input
                                        type="number"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        className="w-32 border border-gray-300 rounded-md px-2 py-1 text-right font-medium text-lg"
                                        placeholder="$"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700">Devuelta:</span>
                                    <span className={`text-xl font-bold ${Number(cashReceived) >= totalInfo.total
                                        ? 'text-blue-600'
                                        : 'text-gray-400'
                                        }`}>
                                        {(() => {
                                            const total = totalInfo.total;
                                            const received = Number(cashReceived) || 0;
                                            const change = received - total;
                                            return change >= 0 ? `$${change.toLocaleString()}` : '---';
                                        })()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Visual breakdown of applied discount */}
                    {(selectedAgreementId || (discount && Number(discount) > 0)) && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-800">
                            <span className="font-bold">Descuento aplicado: </span>
                            {selectedAgreementId
                                ? (() => {
                                    const a = agreements.find(a => a.id.toString() === selectedAgreementId);
                                    return a ? `${a.name} (${a.type === 'FREE_HOURS' ? `${a.value}h` : a.type === 'PERCENTAGE' ? `${a.value}%` : `$${a.value}`})` : '';
                                })()
                                : `Manual ($${discount})`
                            }
                        </div>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
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
