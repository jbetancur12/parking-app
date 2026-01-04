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

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setPlate('');
            setVehicleType('CAR');
            setPlanType('HOUR');
        }
    }, [isOpen]);

    // Auto-select plan type logic
    useEffect(() => {
        const currentTariff = tariffs.find(t => t.vehicleType === vehicleType);
        // If NOT traditional, force HOUR (Standard) plan
        if (currentTariff && currentTariff.pricingModel !== 'TRADITIONAL') {
            setPlanType('HOUR');
        }
    }, [vehicleType, tariffs]);

    const getFormData = () => ({
        plate,
        vehicleType,
        planType
    });

    return {
        plate,
        setPlate,
        vehicleType,
        setVehicleType,
        planType,
        setPlanType,
        getFormData
    };
};
