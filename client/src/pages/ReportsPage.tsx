import { FileText, Search, Download, Building2, MapPin } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportToExcel } from '../utils/excelExport';

export default function ReportsPage() {
    const { user } = useAuth();
    const [reportType, setReportType] = useState<'DAILY' | 'SHIFT' | 'RANGE'>('DAILY');
    const [isConsolidated, setIsConsolidated] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [shiftId, setShiftId] = useState('');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            if (isConsolidated) {
                // Fetch consolidated report
                const params: any = {};
                if (reportType === 'DAILY') params.date = date;
                if (reportType === 'RANGE') {
                    params.dateFrom = dateFrom;
                    params.dateTo = dateTo;
                }
                const res = await api.get('/reports/consolidated', { params });
                setReportData(res.data);
            } else {
                // Fetch regular report
                if (reportType === 'DAILY') {
                    const res = await api.get(`/reports/daily?date=${date}`);
                    setReportData(res.data);
                } else if (reportType === 'RANGE') {
                    const res = await api.get(`/reports/daily?dateFrom=${dateFrom}&dateTo=${dateTo}`);
                    setReportData(res.data);
                } else {
                    if (!shiftId) return;
                    const res = await api.get(`/reports/shift/${shiftId}`);
                    setReportData(res.data);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Error al obtener reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!reportData) return;

        let exportData = [];

        if (isConsolidated) {
            // Export consolidated data
            const { locationStats } = reportData;
            exportData = locationStats.map((loc: any) => ({
                'Sede': loc.locationName,
                'Ingresos': loc.totalIncome,
                'Egresos': loc.totalExpenses,
                'Neto': loc.totalIncome - loc.totalExpenses,
                'Transacciones': loc.transactionCount,
                'Parqueo': loc.parkingHourly + loc.parkingDaily,
                'Mensualidades': loc.monthlyIncome,
                'Lavado': loc.washIncome
            }));
            // Add global summary row
            const { globalStats } = reportData;
            exportData.push({
                'Sede': 'TOTAL CONSOLIDADO',
                'Ingresos': globalStats.totalIncome,
                'Egresos': globalStats.totalExpenses,
                'Neto': globalStats.totalIncome - globalStats.totalExpenses,
                'Transacciones': globalStats.transactionCount,
                'Parqueo': globalStats.parkingHourly + globalStats.parkingDaily,
                'Mensualidades': globalStats.monthlyIncome,
                'Lavado': globalStats.washIncome
            });

        } else {
            // Export regular data
            exportData = [
                {
                    'Tipo': reportType === 'DAILY' ? 'Diario' : reportType === 'RANGE' ? 'Rango' : 'Turno',
                    'Fecha': reportType === 'RANGE' ? `${dateFrom} a ${dateTo}` : date,
                    'Total Ingresos': reportData.totalRevenue || 0,
                    'Total Egresos': reportData.totalExpenses || 0,
                    'Neto': (reportData.totalRevenue || 0) - (reportData.totalExpenses || 0),
                    'Sesiones Parqueo': reportData.parkingSessions || 0,
                    'Clientes Mensuales': reportData.monthlyClients || 0
                }
            ];
        }

        const filename = `Reporte_${isConsolidated ? 'Consolidado' : reportType}_${date}`;
        exportToExcel(exportData, filename, 'Resumen');
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    };

    const formatDescription = (desc: string) => {
        let formatted = desc
            .replace('Parking[HOUR]', 'Parqueo [Hora]')
            .replace('Parking[DAY]', 'Parqueo [Día]')
            .replace('WASH_SERVICE', 'Lavado')
            .replace('MONTHLY_PAYMENT', 'Mensualidad')
            .replace('DESC:', 'Obs:');

        // Regex to find duration in mins and convert to hh:mm:ss
        const durationMatch = formatted.match(/\((\d+)\s*mins?\)/);
        if (durationMatch) {
            const minutes = parseInt(durationMatch[1]);
            formatted = formatted.replace(durationMatch[0], `(${formatDuration(minutes)})`);
        }

        return formatted;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'PARKING_REVENUE': 'Parqueo',
            'MONTHLY_PAYMENT': 'Mensualidad',
            'WASH_SERVICE': 'Lavadero',
            'INCOME': 'Ingreso',
            'EXPENSE': 'Egreso'
        };
        return labels[type] || type;
    };

    const renderConsolidatedView = () => {
        if (!reportData?.globalStats) return null;
        const { globalStats, locationStats } = reportData;

        return (
            <div className="space-y-8">
                {/* Global Summary */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <Building2 className="mr-2" /> Resumen Global ({reportData.tenant?.name})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                            <div className="text-gray-500 text-sm">Ingresos Totales</div>
                            <div className="text-3xl font-bold text-gray-800">${globalStats.totalIncome}</div>
                            <div className="text-xs text-gray-400 mt-1">{globalStats.transactionCount} transacciones en total</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                            <div className="text-gray-500 text-sm">Egresos Totales</div>
                            <div className="text-3xl font-bold text-red-600">${globalStats.totalExpenses}</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
                            <div className="text-gray-500 text-sm">Utilidad Neta</div>
                            <div className="text-3xl font-bold text-green-700">${globalStats.totalIncome - globalStats.totalExpenses}</div>
                        </div>
                    </div>
                </div>

                {/* Location Breakdown */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <MapPin className="mr-2" /> Desglose por Sede
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {locationStats.map((loc: any) => (
                            <div key={loc.locationId} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800">{loc.locationName}</h4>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{loc.transactionCount} txs</span>
                                </div>
                                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500">Ingresos</div>
                                        <div className="font-bold text-green-700">${loc.totalIncome}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Egresos</div>
                                        <div className="font-bold text-red-600">${loc.totalExpenses}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Parqueo</div>
                                        <div className="font-bold text-gray-700">${loc.parkingHourly + loc.parkingDaily}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Neto</div>
                                        <div className="font-bold text-blue-700">${loc.totalIncome - loc.totalExpenses}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-brand-blue flex items-center">
                <FileText className="mr-3" /> Reportes Financieros
                {reportData?.timezone && (
                    <span className="ml-4 text-xs font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        Zona: {reportData.timezone}
                    </span>
                )}
            </h1>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-50 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => { setReportType('DAILY'); setReportData(null); }}
                            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportType === 'DAILY' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Reporte Diario
                        </button>
                        <button
                            onClick={() => { setReportType('RANGE'); setReportData(null); }}
                            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportType === 'RANGE' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Rango de Fechas
                        </button>
                        {!isConsolidated && (
                            <button
                                onClick={() => { setReportType('SHIFT'); setReportData(null); }}
                                className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportType === 'SHIFT' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Reporte de Turno
                            </button>
                        )}
                    </div>

                    {/* Consolidated Toggle (Admin Only) */}
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER') && (
                        <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                            <input
                                type="checkbox"
                                id="consolidated"
                                checked={isConsolidated}
                                onChange={(e) => {
                                    setIsConsolidated(e.target.checked);
                                    setReportData(null);
                                    if (e.target.checked && reportType === 'SHIFT') {
                                        setReportType('DAILY'); // Consolidated doesn't support shift yet
                                    }
                                }}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="consolidated" className="text-sm font-bold text-purple-700 select-none cursor-pointer">
                                Vista Consolidada (Multi-Sede)
                            </label>
                        </div>
                    )}
                </div>

                <div className="flex items-end space-x-4">
                    {reportType === 'DAILY' ? (
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                            />
                        </div>
                    ) : reportType === 'RANGE' ? (
                        <>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Desde</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Hasta</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">ID de Turno</label>
                            <input
                                type="number"
                                placeholder="Ingrese ID Turno"
                                value={shiftId}
                                onChange={(e) => setShiftId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                            />
                        </div>
                    )}
                    <button
                        onClick={fetchReport}
                        className="bg-brand-green text-white font-bold px-6 py-2.5 rounded-lg hover:bg-green-600 flex items-center shadow-md transform transition-all active:scale-95"
                        disabled={loading}
                    >
                        <Search size={18} className="mr-2" />
                        Generar Reporte
                    </button>
                    {reportData && (
                        <button
                            onClick={handleExport}
                            className="bg-brand-blue text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-800 flex items-center shadow-md transform transition-all active:scale-95"
                        >
                            <Download size={18} className="mr-2" />
                            Excel
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {reportData && (
                <>
                    {isConsolidated ? (
                        renderConsolidatedView()
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-blue">
                                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingresos Totales</div>
                                    <div className="text-3xl font-display font-bold text-brand-blue mt-1">${reportData.summary?.totalIncome || reportData.totalIncome || 0}</div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-green">
                                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Transacciones</div>
                                    <div className="text-3xl font-display font-bold text-gray-800 mt-1">{reportData.summary?.transactionCount || reportData.transactionCount || 0}</div>
                                </div>
                                {reportType === 'SHIFT' && (
                                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                                        <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Efectivo en Caja (Est.)</div>
                                        <div className="text-3xl font-display font-bold text-gray-800 mt-1">${reportData.summary?.cashInHand || 0}</div>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Statistics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-red-400">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Egresos</div>
                                    <div className="text-xl font-bold text-red-600">${reportData.totalExpenses || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-green-400">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Otros Ingresos</div>
                                    <div className="text-xl font-bold text-gray-800">${reportData.otherIncome || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-blue-400">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Parqueo (Hora)</div>
                                    <div className="text-xl font-bold text-gray-800">${reportData.parkingHourly || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-purple-400">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Parqueo (Día)</div>
                                    <div className="text-xl font-bold text-gray-800">${reportData.parkingDaily || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-indigo-400">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Mensualidades</div>
                                    <div className="text-xl font-bold text-gray-800">${reportData.monthlyIncome || 0}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border-b-4 border-cyan-400">
                                    <div className="text-gray-500 text-xs font-bold uppercase">Lavadero</div>
                                    <div className="text-xl font-bold text-gray-800">${reportData.washIncome || 0}</div>
                                </div>
                            </div>

                            {/* Detailed List */}
                            {reportData.transactions && (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h3 className="text-lg font-display font-bold text-brand-blue">Detalles de Transacciones</h3>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-brand-blue/5">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Hora</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Descripción</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Tipo</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-brand-blue uppercase tracking-wider">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reportData.transactions.map((t: any) => (
                                                <tr key={t.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(t.timestamp).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatDescription(t.description)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${t.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {getTypeLabel(t.type)}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold font-mono ${t.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
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
                </>
            )}
        </div>
    );
}
