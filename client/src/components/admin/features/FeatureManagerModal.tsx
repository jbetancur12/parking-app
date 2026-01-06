import { useState, useEffect } from 'react';
import { Trash2, X, Edit, Save } from 'lucide-react';
import {
    getFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    type FeatureDefinition
} from '../../../services/featureDefinition.service';

interface FeatureManagerModalProps {
    onClose: () => void;
}

export default function FeatureManagerModal({ onClose }: FeatureManagerModalProps) {
    const [features, setFeatures] = useState<FeatureDefinition[]>([]);
    const [loading, setLoading] = useState(true);

    const [newFeature, setNewFeature] = useState({ key: '', description: '', category: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ description: '', category: '' });

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        try {
            setLoading(true);
            const data = await getFeatures();
            setFeatures(data);
        } catch (err) {
            console.error('Error loading features:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (!newFeature.key || !newFeature.description) return;
            await createFeature(newFeature);
            setNewFeature({ key: '', description: '', category: '' });
            loadFeatures();
        } catch (err: any) {
            alert(err.message || 'Error creating feature');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este feature del banco?')) return;
        try {
            await deleteFeature(id);
            loadFeatures();
        } catch (err: any) {
            alert(err.message || 'Error deleting feature');
        }
    };

    const startEdit = (feature: FeatureDefinition) => {
        setEditingId(feature.id);
        setEditForm({ description: feature.description, category: feature.category || '' });
    };

    const saveEdit = async (id: number) => {
        try {
            await updateFeature(id, editForm);
            setEditingId(null);
            loadFeatures();
        } catch (err: any) {
            alert(err.message || 'Error updating feature');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-gray-900">
                            Banco de Features
                        </h2>
                        <p className="text-sm text-gray-600">
                            Define las funcionalidades disponibles para asignar a los planes.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Add New */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                        <h3 className="text-sm font-bold text-purple-900 uppercase mb-3">Agregar Nueva Definición</h3>
                        <div className="grid md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-purple-800 mb-1">Key (Código)</label>
                                <input
                                    type="text"
                                    value={newFeature.key}
                                    onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded font-mono"
                                    placeholder="ej: can_export"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-semibold text-purple-800 mb-1">Descripción</label>
                                <input
                                    type="text"
                                    value={newFeature.description}
                                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded"
                                    placeholder="ej: Permite exportar..."
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-purple-800 mb-1">Categoría</label>
                                <input
                                    type="text"
                                    value={newFeature.category}
                                    onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded"
                                    placeholder="ej: Reportes"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    onClick={handleCreate}
                                    disabled={!newFeature.key || !newFeature.description}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-8">Cargando...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {features.map((feature) => (
                                    <tr key={feature.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {feature.key}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {editingId === feature.id ? (
                                                <input
                                                    type="text"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            ) : (
                                                feature.description
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {editingId === feature.id ? (
                                                <input
                                                    type="text"
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {feature.category || 'General'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingId === feature.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => saveEdit(feature.id)} className="text-green-600 hover:text-green-900"><Save size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => startEdit(feature)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(feature.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
