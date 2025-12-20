import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Car, Bike, Truck, X } from 'lucide-react';

interface ParkingSession {
    id: number;
    plate: string;
    vehicleType: string;
    entryTime: string;
}

export default function ParkingPage() {
    const [sessions, setSessions] = useState<ParkingSession[]>([]);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    // Entry Form State
    const [plate, setPlate] = useState('');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [error, setError] = useState('');

    // Exit State
    const [exitResult, setExitResult] = useState<any>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/parking/active');
            setSessions(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/parking/entry', { plate: plate.toUpperCase(), vehicleType });
            setIsEntryModalOpen(false);
            setPlate('');
            fetchSessions();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Entry failed');
        }
    };

    const handleExit = async (plate: string) => {
        if (!confirm(`Register exit for ${plate}?`)) return;
        try {
            const response = await api.post('/parking/exit', { plate });
            setExitResult(response.data);
            fetchSessions();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Exit failed');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Parking Management</h1>
                <button
                    onClick={() => setIsEntryModalOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="mr-2" size={20} />
                    New Entry
                </button>
            </div>

            {/* Exit Receipt Modal/Overlay */}
            {exitResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4 text-green-600">Exit Successful</h2>
                        <div className="space-y-2 mb-6">
                            <p><strong>Plate:</strong> {exitResult.session.plate}</p>
                            <p><strong>Duration:</strong> {exitResult.durationMinutes} min</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">Total: ${exitResult.cost}</p>
                        </div>
                        <button
                            onClick={() => setExitResult(null)}
                            className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                        {/* Print Button Placeholder */}
                        <button
                            onClick={() => window.print()}
                            className="w-full mt-2 border border-gray-300 text-gray-600 py-2 rounded hover:bg-gray-50"
                        >
                            Print Receipt
                        </button>
                    </div>
                </div>
            )}

            {/* Entry Modal */}
            {isEntryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Vehicle Entry</h2>
                            <button onClick={() => setIsEntryModalOpen(false)}><X size={20} /></button>
                        </div>

                        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleEntrySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">License Plate</label>
                                <input
                                    type="text"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 uppercase"
                                    placeholder="ABC-123"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {['CAR', 'MOTORCYCLE', 'OTHER'].map((type) => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setVehicleType(type)}
                                            className={`py-2 text-sm rounded-md border ${vehicleType === type
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                            >
                                Register Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map((session) => (
                                <tr key={session.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="flex items-center">
                                            {session.vehicleType === 'CAR' ? <Car size={18} className="mr-2 text-gray-500" /> :
                                                session.vehicleType === 'MOTORCYCLE' ? <Bike size={18} className="mr-2 text-gray-500" /> :
                                                    <Truck size={18} className="mr-2 text-gray-500" />}
                                            {session.vehicleType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{session.plate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(session.entryTime).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleExit(session.plate)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 text-xs px-3 py-1 rounded-full font-medium"
                                        >
                                            Checkout
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No active vehicles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
