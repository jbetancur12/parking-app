import { FileText, Search, Download } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';
import { exportToExcel } from '../utils/excelExport';

export default function ReportsPage() {
    const [reportType, setReportType] = useState<'DAILY' | 'SHIFT' | 'RANGE'>('DAILY');
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
        } catch (error) {
            console.error(error);
            alert('Error al obtener reporte');
        } finally {
            setLoading(false);
        }
    };

    const TRANSACTION_TYPES: Record<string, string> = {
        'PARKING_REVENUE': 'Ingreso Parqueo',
        'MONTHLY_PAYMENT': 'Pago Mensualidad',
        'WASH_SERVICE': 'Servicio Lavado',
        'EXPENSE': 'Egreso',
        'INCOME': 'Otro Ingreso'
    };

    const formatDuration = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const secs = 0;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDescription = (desc: string) => {
        let newDesc = desc
            .replace('Parking[HOUR]', 'Parqueo[HORA]')
            .replace('Parking[DAY]', 'Parqueo[DÍA]')
            .replace('Nova Mensualidad', 'Nueva Mensualidad') // Correction if needed, usually 'Nueva'
            .replace('New Monthly', 'Nueva Mensualidad'); // Cover base case if English

        // Regex to find duration in mins and replace with hh:mm:ss
        // Matches "(1239 mins)"
        const durationMatch = newDesc.match(/\((\d+)\s*mins\)/);
        if (durationMatch) {
            const minutes = parseInt(durationMatch[1]);
            const formattedTime = formatDuration(minutes);
            newDesc = newDesc.replace(durationMatch[0], `(${formattedTime})`);
        }

        return newDesc;
    };

    const handleExport = () => {
        if (!reportData) return;

        const exportData = [
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

        const filename = `Reporte_${reportType}_${date}`;
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3" /> Reportes Financieros
                {reportData?.timezone && (
                    <span className="ml-4 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                        Zona: {reportData.timezone}
                    </span>
                )}
            </h1>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => { setReportType('DAILY'); setReportData(null); }}
                        className={`px-4 py-2 rounded-md ${reportType === 'DAILY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Reporte Diario
                    </button>
                    <button
                        onClick={() => { setReportType('RANGE'); setReportData(null); }}
                        className={`px-4 py-2 rounded-md ${reportType === 'RANGE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Rango de Fechas
                    </button>
                    <button
                        onClick={() => { setReportType('SHIFT'); setReportData(null); }}
                        className={`px-4 py-2 rounded-md ${reportType === 'SHIFT' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Reporte de Turno
                    </button>
                </div>

                <div className="flex items-end space-x-4">
                    {reportType === 'DAILY' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border rounded-md px-3 py-2"
                            />
                        </div>
                    ) : reportType === 'RANGE' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="border rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="border rounded-md px-3 py-2"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID de Turno</label>
                            <input
                                type="number"
                                placeholder="Ingrese ID Turno"
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
                        Generar Reporte
                    </button>
                    {reportData && (
                        <button
                            onClick={handleExport}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                        >
                            <Download size={18} className="mr-2" />
                            Exportar a Excel
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {reportData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <div className="text-gray-500 text-sm">Ingresos Totales</div>
                            <div className="text-2xl font-bold text-gray-800">${reportData.summary?.totalIncome || reportData.totalIncome || 0}</div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                            <div className="text-gray-500 text-sm">Transacciones</div>
                            <div className="text-2xl font-bold text-gray-800">{reportData.summary?.transactionCount || reportData.transactionCount || 0}</div>
                        </div>
                        {reportType === 'SHIFT' && (
                            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                                <div className="text-gray-500 text-sm">Efectivo en Caja (Est.)</div>
                                <div className="text-2xl font-bold text-gray-800">${reportData.summary?.cashInHand || 0}</div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow border-b-4 border-red-400">
                            <div className="text-gray-500 text-xs uppercase">Egresos</div>
                            <div className="text-xl font-bold text-red-600">${reportData.totalExpenses || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-b-4 border-green-400">
                            <div className="text-gray-500 text-xs uppercase">Otros Ingresos</div>
                            <div className="text-xl font-bold text-gray-800">${reportData.otherIncome || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-b-4 border-blue-400">
                            <div className="text-gray-500 text-xs uppercase">Parqueo (Hora)</div>
                            <div className="text-xl font-bold text-gray-800">${reportData.parkingHourly || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-b-4 border-purple-400">
                            <div className="text-gray-500 text-xs uppercase">Parqueo (Día)</div>
                            <div className="text-xl font-bold text-gray-800">${reportData.parkingDaily || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-b-4 border-indigo-400">
                            <div className="text-gray-500 text-xs uppercase">Mensualidades</div>
                            <div className="text-xl font-bold text-gray-800">${reportData.monthlyIncome || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border-b-4 border-cyan-400">
                            <div className="text-gray-500 text-xs uppercase">Lavadero</div>
                            <div className="text-xl font-bold text-gray-800">${reportData.washIncome || 0}</div>
                        </div>
                    </div>

                    {/* Detailed List */}
                    {reportData.transactions && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-800">Detalles de Transacciones</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.transactions.map((t: any) => (
                                        <tr key={t.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(t.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDescription(t.description)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
<<<<<<< HEAD
                                                    {TRANSACTION_TYPES[t.type] || t.type}
=======
                                                    {getTypeLabel(t.type)}
>>>>>>> master
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
