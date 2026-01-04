import { formatCurrency } from '../../utils/formatters';

interface FinancialStatsGridProps {
    consolidatedData: any;
}

export const FinancialStatsGrid: React.FC<FinancialStatsGridProps> = ({ consolidatedData }) => {
    if (!consolidatedData) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-brand-blue">
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Total Ingresos (Global)</div>
                <div className="text-2xl font-bold text-brand-blue dark:text-blue-300">{formatCurrency(consolidatedData.globalStats?.totalIncome)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-brand-green">
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Transacciones Totales</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{consolidatedData.globalStats?.transactionCount}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-purple-600">
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Parqueo Total</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(consolidatedData.globalStats?.parkingHourly + consolidatedData.globalStats?.parkingDaily)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-brand-yellow">
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Sedes Activas</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{consolidatedData.locationStats?.length || 0}</div>
            </div>
        </div>
    );
};
