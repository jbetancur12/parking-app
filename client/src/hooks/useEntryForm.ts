import { useState, useEffect } from 'react';
import type { Tariff } from '../services/tariff.service';

interface UseEntryFormProps {
    isOpen: boolean;
    tariffs: Tariff[];
}

export const useEntryForm = ({ isOpen, tariffs }: UseEntryFormProps) => {
    const [plate, setPlate] = useState('');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [planType, setPlanType] = useState('HOUR');

    const [notes, setNotes] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setPlate('');
            setVehicleType('CAR');
            setPlanType('HOUR');
            setNotes('');
        }
    }, [isOpen]);

    // Auto-select plan type logic
    useEffect(() => {
        if (!Array.isArray(tariffs)) return; // Safety check
        const currentTariff = tariffs.find(t => t.vehicleType === vehicleType);
        const fallbackTariff = tariffs.find(t => t.vehicleType === 'CAR');

        // Force OTHER to follow Global/CAR model
        const effectiveModel = vehicleType === 'OTHER'
            ? fallbackTariff?.pricingModel
            : (currentTariff?.pricingModel || fallbackTariff?.pricingModel);

        const model = effectiveModel || 'MINUTE';

        // If NOT traditional, force HOUR (Standard) plan
        if (model !== 'TRADITIONAL') {
            setPlanType('HOUR');
        }
    }, [vehicleType, tariffs]);

    const getFormData = () => ({
        plate,
        vehicleType,
        planType,
        notes
    });

    return {
        plate,
        setPlate,
        vehicleType,
        setVehicleType,
        planType,
        setPlanType,
        notes,
        setNotes,
        getFormData
    };
};
