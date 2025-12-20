import { FileText, Search } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';

export default function ReportsPage() {
    const [reportType, setReportType] = useState<'DAILY' | 'SHIFT'>('DAILY');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [shiftId, setShiftId] = useState('');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            if (reportType === 'DAILY') {
                const res = await api.get(`/reports/daily?date=${date}`);
                setReportData(res.data);
            } else {
                if (!shiftId) return;
                const res = await api.get(`/reports/shift/${shiftId}`);
                setReportData(res.data);
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3" /> Financial Reports
            </h1>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => { setReportType('DAILY'); setReportData(null); }}
                        className={`px-4 py-2 rounded-md ${reportType === 'DAILY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Daily Report
                    </button>
                    <button
                        onClick={() => { setReportType('SHIFT'); setReportData(null); }}
                        className={`px-4 py-2 rounded-md ${reportType === 'SHIFT' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Shift Report
                    </button>
                </div>

                <div className="flex items-end space-x-4">
                    {reportType === 'DAILY' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border rounded-md px-3 py-2"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shift ID</label>
                            <input
                                type="number"
                                placeholder="Enter Shift ID"
                                value={shiftId}
                                onChange={(e) => setShiftId(e.target.value)}
                                className="border rounded-md px-3 py-2"
                            />
                        </div>
                    )}
                    <button
                        onClick={fetchReport}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                        disabled={loading}
                    >
                        <Search size={18} className="mr-2" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Results */}
            {reportData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <div className="text-gray-500 text-sm">Total Income</div>
                            <div className="text-2xl font-bold text-gray-800">${reportData.summary?.totalIncome || reportData.totalIncome || 0}</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                            <div className="text-gray-500 text-sm">Transactions</div>
                            <div className="text-2xl font-bold text-gray-800">{reportData.summary?.transactionCount || reportData.transactionCount || 0}</div>
                        </div>
                        {reportType === 'SHIFT' && (
                            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                                <div className="text-gray-500 text-sm">Cash in Hand (Est.)</div>
                                <div className="text-2xl font-bold text-gray-800">${reportData.summary?.cashInHand || 0}</div>
                            </div>
                        )}
                    </div>

                    {/* Detailed List */}
                    {reportData.transactions && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.transactions.map((t: any) => (
                                        <tr key={t.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(t.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {t.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                                ${Number(t.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
