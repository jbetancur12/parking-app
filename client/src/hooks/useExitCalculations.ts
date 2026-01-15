import { useState } from 'react';
import type { Tariff } from '../services/tariff.service';
import { formatCurrency } from '../utils/formatters';

interface UseExitCalculationsProps {
    previewData: any;
    agreements: any[];
    tariffs: Tariff[];
}

/**
 * Custom hook for managing exit calculations including discounts, agreements, and loyalty redemption.
 * 
 * **Complexity:** High - Handles complex pricing logic with multiple discount types
 * 
 * **Responsibilities:**
 * - Calculate final cost with discounts (manual, agreements, loyalty)
 * - Manage payment method selection
 * - Handle loyalty point redemption
 * - Calculate change for cash payments
 * - Priority system: Redemption > Agreements > Manual Discounts
 * 
 * **Discount Types:**
 * - FREE_HOURS: Discount based on hourly rate × hours
 * - PERCENTAGE: Percentage off total cost
 * - FLAT_DISCOUNT: Fixed amount off
 * - LOYALTY: Free hours or total redemption based on points
 * 
 * @param {Object} props - Hook configuration
 * @param {any} props.previewData - Exit preview data with cost and duration
 * @param {any[]} props.agreements - Available discount agreements
 * @param {Tariff[]} props.tariffs - Pricing tariffs for plan label calculation
 * 
 * @returns {Object} Calculation state and handlers
 * @returns {string} returns.paymentMethod - Selected payment method (CASH | TRANSFER)
 * @returns {string} returns.discount - Manual discount amount
 * @returns {Function} returns.calculateTotal - Calculates final total with all discounts
 * @returns {Function} returns.calculateChange - Calculates change for cash payments
 * @returns {Function} returns.handleRedeemToggle - Toggles loyalty redemption
 * @returns {Function} returns.handleAgreementChange - Handles agreement selection
 * 
 * @example
 * ```tsx
 * const {
 *   calculateTotal,
 *   paymentMethod,
 *   setPaymentMethod
 * } = useExitCalculations({ previewData, agreements, tariffs });
 * 
 * const { total, text } = calculateTotal();
 * ```
 */
export const useExitCalculations = ({ previewData, agreements, tariffs }: UseExitCalculationsProps) => {
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
    const [discount, setDiscount] = useState('');
    const [discountReason, setDiscountReason] = useState('');
    const [selectedAgreementId, setSelectedAgreementId] = useState('');
    const [redeem, setRedeem] = useState(false);
    const [cashReceived, setCashReceived] = useState('');

    const getPlanLabel = () => {
        if (!Array.isArray(tariffs)) return 'Por Hora';
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
                return { total: finalVal, text: `${formatCurrency(finalVal)} (Desc. ${previewData.loyalty.rewardHours}h)` };
            }
            return { total: 0, text: `${formatCurrency(0)} (Canje Total)` };
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

        return { total: finalTotal, text: formatCurrency(finalTotal) };
    };

    const handleRedeemToggle = () => {
        setRedeem(!redeem);
        if (!redeem) {
            // Disable other discounts if redeeming
            setDiscount('');
            setSelectedAgreementId('');
        }
    };

    const handleAgreementChange = (agreementId: string) => {
        setSelectedAgreementId(agreementId);
        if (agreementId) {
            setDiscount('');
            setDiscountReason('');
        }
    };

    const calculateChange = () => {
        const total = calculateTotal().total;
        const received = Number(cashReceived) || 0;
        const change = received - total;
        return change >= 0 ? formatCurrency(change) : '---';
    };

    const getAppliedDiscountText = () => {
        if (selectedAgreementId) {
            const a = agreements.find(a => a.id.toString() === selectedAgreementId);
            return a ? `${a.name} (${a.type === 'FREE_HOURS' ? `${a.value}h` : a.type === 'PERCENTAGE' ? `${a.value}%` : formatCurrency(a.value)})` : '';
        }
        return `Manual (${formatCurrency(Number(discount))})`;
    };

    return {
        // State
        paymentMethod,
        setPaymentMethod,
        discount,
        setDiscount,
        discountReason,
        setDiscountReason,
        selectedAgreementId,
        setSelectedAgreementId,
        redeem,
        setRedeem,
        cashReceived,
        setCashReceived,

        // Computed
        getPlanLabel,
        calculateTotal,
        calculateChange,
        getAppliedDiscountText,

        // Handlers
        handleRedeemToggle,
        handleAgreementChange
    };
};
