import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Smartphone, Slash } from 'lucide-react';
import api from '../api/client';
import type { License, CreateLicenseDTO } from '../types/license';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function LicensesPage() {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/licenses');
            setLicenses(res.data);
        } catch (error) {
            console.error('Error fetching licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLicense = async (data: CreateLicenseDTO) => {
        try {
            await api.post('/admin/licenses', data);
            setShowCreateModal(false);
            fetchLicenses();
        } catch (error) {
            alert('Error creating license');
        }
    };

    const handleRevoke = async (id: number) => {
        if (!confirm('¿Seguro que deseas revocar esta licencia? Esta acción no se puede deshacer.')) return;
        try {
            await api.put(`/admin/licenses/${id}/revoke`);
            fetchLicenses();
        } catch (error) {
            alert('Error revoking license');
        }
    };

    const handleRenew = async (id: number) => {
        if (!confirm('¿Extender vigencia por 1 año?')) return;
        try {
            await api.put(`/admin/licenses/${id}/renew`, { months: 12 });
            fetchLicenses();
        } catch (error) {
            alert('Error renewing license');
        }
    };

    const handleTransfer = async (id: number) => {
        if (!confirm('¿Resetear hardware ID para permitir activación en otro equipo?')) return;
        try {
            await api.put(`/admin/licenses/${id}/transfer`);
            fetchLicenses();
        } catch (error) {
            alert('Error transferring license');
        }
    };

    const filteredLicenses = licenses.filter(license => {
        const matchesSearch =
            license.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            license.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || license.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Licencias</h1>
                    <p className="text-gray-500 dark:text-gray-400">Administra todas las licencias emitidas</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Licencia
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, email o clave..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="pending">Pendientes</option>
                    <option value="expired">Expiradas</option>
                    <option value="revoked">Revocadas</option>
                </select>
            </div>

            {/* Licenses Table */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Licencia</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Expiración</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando licencias...</td>
                                </tr>
                            ) : filteredLicenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron licencias</td>
                                </tr>
                            ) : (
                                filteredLicenses.map((license) => (
                                    <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{license.customerName}</div>
                                            <div className="text-gray-500 text-xs">{license.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300 select-all">
                                            {license.licenseKey}
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            {license.type === 'trial' ? (
                                                <span className="text-orange-600 dark:text-orange-400">Trial</span>
                                            ) : (
                                                <span className="text-blue-600 dark:text-blue-400">Full</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {format(new Date(license.expiresAt), 'dd MMM yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={license.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRenew(license.id)}
                                                    title="Renovar (+1 año)"
                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleTransfer(license.id)}
                                                    title="Resetear Hardware ID (Transferir)"
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Smartphone className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRevoke(license.id)}
                                                    title="Revocar Licencia"
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Slash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateLicenseModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateLicense}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        revoked: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    }[status] || "bg-gray-100 text-gray-800";

    const labels = {
        active: "Activa",
        pending: "Pendiente",
        expired: "Expirada",
        revoked: "Revocada",
    }[status] || status;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
            {labels}
        </span>
    );
}

function CreateLicenseModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: CreateLicenseDTO) => void }) {
    const [formData, setFormData] = useState<CreateLicenseDTO>({
        customerName: '',
        customerEmail: '',
        type: 'full',
        months: 12,
        maxLocations: 1
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Generar Nueva Licencia</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Cliente</label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-900 dark:text-white"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-900 dark:text-white"
                            value={formData.customerEmail}
                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-900 dark:text-white"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="full">Licencia Full</option>
                                <option value="trial">Trial (Prueba)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (Meses)</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-900 dark:text-white"
                                value={formData.months}
                                onChange={e => setFormData({ ...formData, months: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
