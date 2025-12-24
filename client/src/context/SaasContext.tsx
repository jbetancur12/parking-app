import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

interface Location {
    id: string;
    name: string;
}

interface SaasContextType {
    currentTenant: Tenant | null;
    currentLocation: Location | null;
    setCurrentTenant: (tenant: Tenant | null) => void;
    setCurrentLocation: (location: Location | null) => void;
    availableTenants: Tenant[];
}

const SaasContext = createContext<SaasContextType | undefined>(undefined);

export const SaasProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    // Initialize from localStorage or user's first tenant
    const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(() => {
        const stored = localStorage.getItem('currentTenant');
        return stored ? JSON.parse(stored) : null;
    });

    const [currentLocation, setCurrentLocationState] = useState<Location | null>(() => {
        const stored = localStorage.getItem('currentLocation');
        return stored ? JSON.parse(stored) : null;
    });

    // Auto-select tenant on login if only one available
    useEffect(() => {
        if (user && user.tenants && user.tenants.length > 0) {
            // If no current tenant selected, auto-select
            if (!currentTenant) {
                if (user.tenants.length === 1) {
                    // Auto-select single tenant
                    setCurrentTenant(user.tenants[0]);
                }
            }

            // Auto-select location if user has exactly one fixed location
            // and no location is currently set
            if (user.locations && user.locations.length === 1 && !currentLocation) {
                setCurrentLocation(user.locations[0]);
            }
        } else if (!user) {
            // Clear context on logout
            setCurrentTenantState(null);
            setCurrentLocationState(null);
        }
    }, [user]);

    const setCurrentTenant = (tenant: Tenant | null) => {
        setCurrentTenantState(tenant);
        if (tenant) {
            localStorage.setItem('currentTenant', JSON.stringify(tenant));
        } else {
            localStorage.removeItem('currentTenant');
        }
    };

    const setCurrentLocation = (location: Location | null) => {
        setCurrentLocationState(location);
        if (location) {
            localStorage.setItem('currentLocation', JSON.stringify(location));
        } else {
            localStorage.removeItem('currentLocation');
        }
    };

    return (
        <SaasContext.Provider
            value={{
                currentTenant,
                currentLocation,
                setCurrentTenant,
                setCurrentLocation,
                availableTenants: user?.tenants || [],
            }}
        >
            {children}
        </SaasContext.Provider>
    );
};

export const useSaas = () => {
    const context = useContext(SaasContext);
    if (!context) {
        throw new Error('useSaas must be used within a SaasProvider');
    }
    return context;
};
