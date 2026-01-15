import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { useSaas } from './SaasContext';
import { useAuth } from './AuthContext';

interface Shift {
    id: number;
    startTime: string;
    isActive: boolean;
    baseAmount: number;
}

interface ShiftContextType {
    activeShift: Shift | null;
    loading: boolean;
    checkActiveShift: () => Promise<void>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider = ({ children }: { children: ReactNode }) => {
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(true);
    const { currentLocation } = useSaas();
    const { user } = useAuth();

    const checkActiveShift = async () => {
        if (!currentLocation) {
            setActiveShift(null);
            setLoading(false);
            return;
        }

        // SuperAdmin doesn't operate the parking lot, so skip shift check
        if (user?.role?.toLowerCase() === 'super_admin') {
            setActiveShift(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkActiveShift();
    }, [currentLocation]);

    return (
        <ShiftContext.Provider value={{ activeShift, loading, checkActiveShift }}>
            {children}
        </ShiftContext.Provider>
    );
};

export const useShift = () => {
    const context = useContext(ShiftContext);
    if (!context) {
        throw new Error('useShift must be used within a ShiftProvider');
    }
    return context;
};
