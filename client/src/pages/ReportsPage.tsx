import { FileText } from 'lucide-react';
import { useReportsPage } from '../hooks/useReportsPage';
import { ReportControls } from '../components/reports/ReportControls';
import { ConsolidatedReportView } from '../components/reports/ConsolidatedReportView';
import { StandardReportView } from '../components/reports/StandardReportView';

export default function ReportsPage() {
    const {
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
    } = useReportsPage();

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
            <ReportControls
                reportType={reportType}
                setReportType={setReportType}
                isConsolidated={isConsolidated}
                setIsConsolidated={setIsConsolidated}
                date={date}
                setDate={setDate}
                dateFrom={dateFrom}
                setDateFrom={setDateFrom}
                dateTo={dateTo}
                setDateTo={setDateTo}
                shiftId={shiftId}
                setShiftId={setShiftId}
                onSearch={fetchReport}
                onExport={handleExport}
                loading={loading}
                hasData={!!reportData}
                user={user}
                onClearData={() => setReportData(null)}
            />

            {/* Results */}
            {reportData && (
                <>
                    {isConsolidated ? (
                        <ConsolidatedReportView data={reportData} />
                    ) : (
                        <StandardReportView data={reportData} reportType={reportType} />
                    )}
                </>
            )}
        </div>
    );
}
