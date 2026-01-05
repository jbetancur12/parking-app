import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Detect if running in Electron
const isElectron = import.meta.env.VITE_APP_MODE === 'electron';

export const useLoginFlow = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Unified check for Electron: License -> Setup
    useEffect(() => {
        if (!isElectron) return; // Skip in web version

        const initChecks = async () => {
            // 1. Check License first
            try {
                const result = await (window as any).electronAPI?.validateLicense();
                if (!result || !result.isValid) {
                    console.log('No valid license found, redirecting to /license');
                    navigate('/license');
                    return; // Stop here, do not check setup
                }
            } catch (error) {
                console.error('Error checking license:', error);
                navigate('/license');
                return;
            }

            // 2. Check Setup (only if license is valid)
            try {
                const response = await api.get('/auth/setup-status');
                if (!response.data.isConfigured) {
                    navigate('/setup');
                }
            } catch (error) {
                console.error('Error checking setup status', error);
            }
        };

        initChecks();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = response.data.user;
            login(response.data.token, userData);

            // Redirect based on role and locations
            if (userData.role === 'SUPER_ADMIN') {
                navigate('/admin/tenants');
            } else if (userData.locations && userData.locations.length > 1) {
                navigate('/select-location');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Credenciales inválidas');
        }
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        handleLogin
    };
};
