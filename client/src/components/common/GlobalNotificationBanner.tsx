import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger';
}

export const GlobalNotificationBanner: React.FC = () => {
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { isAuthenticated, user } = useAuth();
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isAuthenticated || user?.role === 'SUPER_ADMIN') return;

        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications/active'); // Note: changed from admin/notifications to public endpoint
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        fetchNotifications();

        // Poll every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const activeNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

    if (activeNotifications.length === 0 || user?.role === 'SUPER_ADMIN') return null;

    const currentNotification = activeNotifications[currentIndex % activeNotifications.length];

    const getStyles = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-amber-100 text-amber-900 border-b border-amber-200 dark:bg-amber-900/50 dark:text-amber-100 dark:border-amber-800';
            case 'danger': return 'bg-red-100 text-red-900 border-b border-red-200 dark:bg-red-900/50 dark:text-red-100 dark:border-red-800';
            default: return 'bg-blue-100 text-blue-900 border-b border-blue-200 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-800';
        }
    };

    const handleDismiss = () => {
        setDismissedIds(prev => [...prev, currentNotification.id]);
        if (activeNotifications.length > 1) {
            setCurrentIndex(prev => (prev + 1) % (activeNotifications.length - 1));
        }
    };

    return (
        <div className={`px-4 py-2 flex items-center justify-between transition-colors ${getStyles(currentNotification.type)}`}>
            <div className="flex items-center gap-3 container mx-auto max-w-7xl">
                {currentNotification.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0" /> :
                    currentNotification.type === 'danger' ? <AlertCircle className="h-5 w-5 shrink-0" /> :
                        <Info className="h-5 w-5 shrink-0" />}

                <p className="text-sm font-medium">
                    <span className="font-bold mr-2">{currentNotification.title}:</span>
                    {currentNotification.message}
                </p>
            </div>

            <button
                onClick={handleDismiss}
                className="ml-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};
