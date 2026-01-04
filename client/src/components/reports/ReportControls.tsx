import React from 'react';
import { Search, Download } from 'lucide-react';

interface ReportControlsProps {
    reportType: 'DAILY' | 'SHIFT' | 'RANGE';
    setReportType: (type: 'DAILY' | 'SHIFT' | 'RANGE') => void;
    isConsolidated: boolean;
    setIsConsolidated: (val: boolean) => void;
    date: string;
    setDate: (val: string) => void;
    dateFrom: string;
    setDateFrom: (val: string) => void;
    dateTo: string;
    setDateTo: (val: string) => void;
    shiftId: string;
    setShiftId: (val: string) => void;
    onSearch: () => void;
    onExport: () => void;
    loading: boolean;
    hasData: boolean;
    user: any;
    onClearData: () => void;
}

export const ReportControls: React.FC<ReportControlsProps> = ({
    reportType, setReportType,
    isConsolidated, setIsConsolidated,
    date, setDate,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    shiftId, setShiftId,
    onSearch,
    onExport,
    loading,
    hasData,
    user,
    onClearData
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-blue-50 dark:border-gray-700 space-y-4 transition-colors">
            <div className="flex justify-between items-center">
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg transition-colors">
                    <button
                        onClick={() => { setReportType('DAILY'); onClearData(); }}
                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportType === 'DAILY' ? 'bg-white dark:bg-gray-600 text-brand-blue dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Reporte Diario
                    </button>
                    <button
                        onClick={() => { setReportType('RANGE'); onClearData(); }}
                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportType === 'RANGE' ? 'bg-white dark:bg-gray-600 text-brand-blue dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Rango de Fechas
                    </button>
                    {!isConsolidated && (
                        <button
                            onClick={() => { setReportType('SHIFT'); onClearData(); }}
                            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${reportType === 'SHIFT' ? 'bg-white dark:bg-gray-600 text-brand-blue dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            Reporte de Turno
                        </button>
                    )}
                </div>

                {/* Consolidated Toggle (Admin Only) */}
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'LOCATION_MANAGER') && (
                    <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                        <input
                            type="checkbox"
                            id="consolidated"
                            checked={isConsolidated}
                            onChange={(e) => {
                                setIsConsolidated(e.target.checked);
                                onClearData();
                                if (e.target.checked && reportType === 'SHIFT') {
                                    setReportType('DAILY'); // Consolidated doesn't support shift yet
                                }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700"
                        />
                        <label htmlFor="consolidated" className="text-sm font-bold text-purple-700 dark:text-purple-300 select-none cursor-pointer">
                            Vista Consolidada (Multi-Sede)
                        </label>
                    </div>
                )}
            </div>

            <div className="flex items-end space-x-4">
                {reportType === 'DAILY' ? (
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                ) : reportType === 'RANGE' ? (
                    <>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Desde</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hasta</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ID de Turno</label>
                        <input
                            type="number"
                            placeholder="Ingrese ID Turno"
                            value={shiftId}
                            onChange={(e) => setShiftId(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                )}
                <button
                    onClick={onSearch}
                    className="bg-brand-green dark:bg-green-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-green-600 dark:hover:bg-green-500 flex items-center shadow-md transform transition-all active:scale-95"
                    disabled={loading}
                >
                    <Search size={18} className="mr-2" />
                    Generar Reporte
                </button>
                {hasData && (
                    <button
                        onClick={onExport}
                        className="bg-brand-blue dark:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 flex items-center shadow-md transform transition-all active:scale-95"
                    >
                        <Download size={18} className="mr-2" />
                        Excel
                    </button>
                )}
            </div>
        </div>
    );
};
