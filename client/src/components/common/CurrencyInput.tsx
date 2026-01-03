import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number | string;
    onValueChange: (value: string) => void;
    className?: string; // Explicitly allow className to be passed
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onValueChange, className = '', ...props }) => {
    // Keep internal local state for the display value to avoid cursor jumping issues
    // and to allow temporary invalid states (like empty string)
    const [displayValue, setDisplayValue] = useState('');

    // Update display value when the prop value changes externally (e.g. from parent reset)
    useEffect(() => {
        if (value === '' || value === undefined || value === null) {
            setDisplayValue('');
        } else {
            // Only format if it's a valid number
            if (!isNaN(Number(value))) {
                setDisplayValue(formatNumber(Number(value)));
            }
        }
    }, [value]);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 1. Get raw value (remove all non-numeric characters)
        const rawValue = e.target.value.replace(/[^0-9]/g, '');

        // 2. Pass the raw numeric string to parent
        onValueChange(rawValue);

        // 3. Format for display
        if (rawValue === '') {
            setDisplayValue('');
        } else {
            const numberValue = parseInt(rawValue, 10);
            setDisplayValue(formatNumber(numberValue));
        }
    };

    return (
        <input
            {...props}
            type="text" // Always text to handle formatting
            inputMode="numeric" // Mobile numeric keyboard
            value={displayValue}
            onChange={handleChange}
            className={className} // Pass through className
        />
    );
};
