import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

export interface AuditLog {
    id: number;
    action: string;
    entity: string;
    entityId: string;
    userId: number;
    username: string;
    details: string; // JSON string
    ipAddress: string;
    timestamp: string;
    location?: {
        id: string;
        name: string;
    };
}

export const useAuditLogs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN' && user?.role !== 'LOCATION_MANAGER') {
            navigate('/');
            return;
        }
        fetchLogs();
    }, [user, navigate]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/audit'); // Uses existing audit.routes.ts
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Error al cargar historial de auditoría');
        } finally {
            setLoading(false);
        }
    };

    return {
        logs,
        loading,
        fetchLogs,
    };
};
