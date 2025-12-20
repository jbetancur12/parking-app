import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Play, Square, AlertCircle } from 'lucide-react';
import { ExpensesSection } from '../components/dashboard/ExpensesSection';
import { WashSection } from '../components/dashboard/WashSection';
import SalesSection from '../components/dashboard/SalesSection';

interface Shift {
    id: number;
    startTime: string;
    isActive: boolean;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(true);
    const [baseAmount, setBaseAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActiveShift();
    }, []);

    const fetchActiveShift = async () => {
        try {
            const response = await api.get('/shifts/current');
            setActiveShift(response.data);
        } catch (err) {
            setActiveShift(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async () => {
        try {
            const response = await api.post('/shifts/open', { baseAmount: Number(baseAmount) });
            setActiveShift(response.data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to open shift');
        }
    };

    const handleCloseShift = async () => {
        // In a real app, this would open a modal to confirm amounts
        if (confirm('Are you sure you want to close the shift?')) {
            try {
                await api.post('/shifts/close', { declaredAmount: 0, notes: 'Quick close' });
                setActiveShift(null);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to close shift');
            }
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user?.username}</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    {error}
                </div>
            )}

            {!activeShift ? (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
                    <h2 className="text-lg font-semibold mb-4">Start New Shift</h2>
                    <p className="text-gray-600 mb-4">You need an active shift to register parking entries.</p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Cash (Base)</label>
                        <input
                            type="number"
                            value={baseAmount}
                            onChange={(e) => setBaseAmount(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                            placeholder="0"
                        />
                    </div>
                    <button
                        onClick={handleOpenShift}
                        className="w-full flex items-center justify-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    >
                        <Play className="mr-2" size={20} />
                        Open Shift
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h2 className="text-lg font-semibold text-gray-700">Active Shift</h2>
                        <p className="text-gray-500 text-sm">Started at: {new Date(activeShift.startTime).toLocaleString()}</p>
                        <div className="mt-4">
                            <button
                                onClick={handleCloseShift}
                                className="flex items-center text-red-600 hover:text-red-800 font-medium"
                            >
                                <Square className="mr-2" size={18} /> Close Shift
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <a href="/parking" className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                View Parking
                            </a>
                            <a href="/reports" className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">
                                View Reports
                            </a>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                        <ExpensesSection shiftId={activeShift.id} />
                    </div>

                    {/* Sales Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                        <SalesSection />
                    </div>

                    {/* Wash Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
                        <WashSection shiftId={activeShift.id} />
                    </div>
                </div>
            )}
        </div>
    );
}
