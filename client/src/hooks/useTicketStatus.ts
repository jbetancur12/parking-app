import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface TicketStatus {
    id: number;
    plate: string;
    vehicleType: string;
    entryTime: string;
    planType: string;
    cost: number;
    durationMinutes: number;
    currentTime: string;
}

export const useTicketStatus = (ticketId?: string) => {
    const [status, setStatus] = useState<TicketStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStatus = useCallback(async () => {
        if (!ticketId) return;
        try {
            // Direct axios call to bypass auth interceptor if configured globally
            // ensuring we hit the public endpoint.
            const response = await axios.get(`${API_URL}/parking/public/status/${ticketId}`);
            setStatus(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('No se pudo encontrar el ticket o ya no está activo.');
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        if (ticketId) {
            fetchStatus();
            // Poll every minute for real-time updates
            const interval = setInterval(fetchStatus, 60000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
            setError('ID de ticket no proporcionado.');
        }
    }, [ticketId, fetchStatus]);

    return {
        status,
        loading,
        error,
        refresh: fetchStatus
    };
};
