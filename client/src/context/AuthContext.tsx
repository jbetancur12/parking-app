import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAutoLogout } from '../hooks/useAutoLogout';

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

interface Location {
    id: string;
    name: string;
}

interface User {
    id: number;
    username: string;
    role: string;
    tenants: Tenant[];
    locations: Location[];
    lastActiveLocation?: Location;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state synchronously from localStorage to avoid race condition
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Hydrate user from server on load (to get fresh locations/roles)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fetch fresh profile
            // We use fetch directly to avoid circular dependency if api.ts imports AuthContext
            // But usually api.ts handles headers. Let's assume api instance is safe or use fetch.
            // Using fetch for safety here to avoid import cycles with Axios interceptors if poorly structured.
            // Actually, let's try a simple fetch.
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Failed to fetch profile');
                })
                .then(userData => {
                    // Update local storage and state with fresh data
                    localStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                })
                .catch(err => {
                    console.error('Session validation failed:', err);
                    // Optional: logout() if strictly invalid, but maybe offline?
                    // For now, just log. If 401, subsequent API calls will fail anyway.
                });
        }
    }, []);

    // Auto-Logout Logic
    useAutoLogout({ onLogout: logout });

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
