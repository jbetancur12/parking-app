import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Activity, Calendar, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Currency formatter for COP
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AdminDashboardPage() {
    const { metrics, churn, ltv, activeUsage, trends, loading, error, refresh } = useAdminDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando métricas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                    <button
                        onClick={refresh}
                        className="mt-2 text-red-600 hover:text-red-800 underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Dashboard Global
                    </h1>
                    <p className="text-gray-600">
                        Métricas y análisis de la plataforma SaaS
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
                >
                    <RefreshCw size={18} />
                    Actualizar
                </button>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
                <Link
                    to="/admin/errors"
                    className="inline-flex bg-white p-4 rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors items-center gap-3 group"
                >
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">Reportes de Error</h3>
                        <p className="text-xs text-gray-500">Ver logs de frontend</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-300 ml-2 group-hover:text-red-500 transition-colors" />
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Tenants */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="text-brand-blue" size={24} />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Empresas</h3>
                    <p className="text-3xl font-bold text-gray-900">{metrics?.totalTenants || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {metrics?.activeTenants || 0} activas
                    </p>
                </div>

                {/* MRR */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="text-brand-green" size={24} />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">MRR</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(metrics?.mrr || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Ingresos mensuales recurrentes</p>
                </div>

                {/* Churn Rate */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${(churn?.churnRate || 0) > 5 ? 'bg-red-100' : 'bg-yellow-100'}`}>
                            <TrendingDown className={(churn?.churnRate || 0) > 5 ? 'text-red-600' : 'text-yellow-600'} size={24} />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Churn Rate</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {churn?.churnRate.toFixed(1) || 0}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Últimos 30 días</p>
                </div>

                {/* LTV */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">LTV Promedio</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(ltv?.averageLTV || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {ltv?.averageLifetimeMonths.toFixed(1) || 0} meses promedio
                    </p>
                </div>
            </div>

            {/* Active Usage Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Active Users Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Users className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Usuarios Activos</h3>
                            <p className="text-sm text-gray-500">Actividad de usuarios en la plataforma</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{activeUsage?.totalUsers || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Última semana</p>
                            <p className="text-2xl font-bold text-brand-green">{activeUsage?.activeLastWeek || 0}</p>
                            <p className="text-xs text-gray-500">{activeUsage?.activeWeekPercentage.toFixed(0)}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Último mes</p>
                            <p className="text-2xl font-bold text-brand-blue">{activeUsage?.activeLastMonth || 0}</p>
                            <p className="text-xs text-gray-500">{activeUsage?.activeMonthPercentage.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Activity className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Distribución de Actividad</h3>
                            <p className="text-sm text-gray-500">Usuarios por nivel de actividad</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                            { name: 'Activos (7d)', value: activeUsage?.activeLastWeek || 0, fill: '#00A859' },
                            { name: 'Activos (30d)', value: (activeUsage?.activeLastMonth || 0) - (activeUsage?.activeLastWeek || 0), fill: '#003B5C' },
                            { name: 'Inactivos', value: activeUsage?.inactiveUsers || 0, fill: '#9CA3AF' }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Trends Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MRR Trend */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="text-brand-green" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Tendencia de Ingresos (MRR)</h3>
                            <p className="text-sm text-gray-500">Últimos 6 meses</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Line type="monotone" dataKey="mrr" stroke="#00A859" strokeWidth={2} name="MRR" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Tenants Growth */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="text-brand-blue" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Crecimiento de Empresas</h3>
                            <p className="text-sm text-gray-500">Últimos 6 meses</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="newTenants" stroke="#FFC72C" strokeWidth={2} name="Nuevas" />
                            <Line type="monotone" dataKey="totalTenants" stroke="#003B5C" strokeWidth={2} name="Total" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Additional Metrics Summary */}
            <div className="mt-8 bg-gradient-to-r from-brand-blue to-indigo-700 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Resumen Ejecutivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-indigo-200 text-sm mb-1">Tasa de Retención</p>
                        <p className="text-3xl font-bold">{(100 - (churn?.churnRate || 0)).toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-indigo-200 text-sm mb-1">Ingreso Promedio por Cliente</p>
                        <p className="text-3xl font-bold">{formatCurrency(ltv?.averageMonthlyRevenue || 0)}</p>
                    </div>
                    <div>
                        <p className="text-indigo-200 text-sm mb-1">Usuarios Activos vs Total</p>
                        <p className="text-3xl font-bold">
                            {activeUsage?.activeLastMonth || 0} / {activeUsage?.totalUsers || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
