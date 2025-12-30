import React from 'react';

interface FinancialStatsGridProps {
    consolidatedData: any;
}

export const FinancialStatsGrid: React.FC<FinancialStatsGridProps> = ({ consolidatedData }) => {
    if (!consolidatedData) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-blue">
                <div className="text-sm font-bold text-gray-500">Total Ingresos (Global)</div>
                <div className="text-2xl font-bold text-brand-blue">${consolidatedData.globalStats?.totalIncome?.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-green">
                <div className="text-sm font-bold text-gray-500">Transacciones Totales</div>
                <div className="text-2xl font-bold text-gray-800">{consolidatedData.globalStats?.transactionCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-600">
                <div className="text-sm font-bold text-gray-500">Parqueo Total</div>
                <div className="text-2xl font-bold text-gray-800">${(consolidatedData.globalStats?.parkingHourly + consolidatedData.globalStats?.parkingDaily)?.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-brand-yellow">
                <div className="text-sm font-bold text-gray-500">Sedes Activas</div>
                <div className="text-2xl font-bold text-gray-800">{consolidatedData.locationStats?.length || 0}</div>
            </div>
        </div>
    );
};
