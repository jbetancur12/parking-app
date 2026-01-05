import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Plus, AlertCircle, Calendar } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger';
    isActive: boolean;
    expiresAt?: string;
    createdAt: string;
}

export const AdminNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // New Notification Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'danger'>('info');
    const [expiresAt, setExpiresAt] = useState('');

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/all');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/notifications', {
                title,
                message,
                type,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            });
            toast.success('Notificación creada');
            setShowForm(false);
            setTitle('');
            setMessage('');
            setExpiresAt('');
            fetchNotifications();
        } catch (error) {
            console.error('Error creating notification:', error);
            toast.error('Error al crear notificación');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta notificación?')) return;
        try {
            await api.delete(`/notifications/${id}`);
            toast.success('Notificación eliminada');
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Error al eliminar notificación');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-brand-blue dark:text-white">Notificaciones Globales</h1>
                    <p className="text-gray-500 dark:text-gray-400">Anuncios del sistema para todos los usuarios</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Notificación
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Crear Nuevo Anuncio</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Ej: Mantenimiento Programado"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                rows={3}
                                placeholder="Detalles del anuncio..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="info">Información (Azul)</option>
                                    <option value="warning">Advertencia (Amarillo)</option>
                                    <option value="danger">Crítico (Rojo)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expira (Opcional)</label>
                                <input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800"
                            >
                                Publicar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-xl border flex justify-between items-start ${notification.type === 'info' ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50' :
                            notification.type === 'warning' ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50' :
                                'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/50'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${notification.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200' :
                                notification.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200' :
                                    'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200'
                                }`}>
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {notification.type.toUpperCase()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                    {notification.expiresAt && (
                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            Expira: {new Date(notification.expiresAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                ))}

                {!loading && notifications.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No hay notificaciones activas</p>
                    </div>
                )}
            </div>
        </div>
    );
};
