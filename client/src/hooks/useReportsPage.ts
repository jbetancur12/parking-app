import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportToExcel } from '../utils/excelExport';

export const useReportsPage = () => {
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

    return {
        user,
        reportType, setReportType,
        isConsolidated, setIsConsolidated,
        date, setDate,
        dateFrom, setDateFrom,
        dateTo, setDateTo,
        shiftId, setShiftId,
        reportData, setReportData,
        loading,
        fetchReport,
        handleExport
    };
};

// Start Helper Functions
export const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

export const formatDescription = (desc: string) => {
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

export const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        'PARKING_REVENUE': 'Parqueo',
        'MONTHLY_PAYMENT': 'Mensualidad',
        'WASH_SERVICE': 'Lavadero',
        'INCOME': 'Ingreso',
        'EXPENSE': 'Egreso'
    };
    return labels[type] || type;
};
