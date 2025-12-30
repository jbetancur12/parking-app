import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface DashboardChartsProps {
    stats: any;
    consolidatedData?: any;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats, consolidatedData }) => {
    if (!stats) return null;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6 mb-8">
            {/* Row 1: Ingresos y Distribución */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ingresos Semanales (2/3) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-display font-bold text-brand-blue flex items-center">
                            <TrendingUp size={20} className="mr-2 text-brand-green" />
                            Ingresos Semanales
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.weeklyIncome}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Ingresos']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#28A745" fill="#D1FAE5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribución de Ingresos (1/3) */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-display font-bold text-brand-blue flex items-center">
                            <Users size={20} className="mr-2 text-brand-blue" />
                            Distribución
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#1A3A5A"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.pieData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Actividad y Desglose */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actividad por Hora (2/3) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-display font-bold text-brand-blue flex items-center">
                            <Clock size={20} className="mr-2 text-purple-500" />
                            Actividad por Hora (30 días)
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" name="Vehículos" fill="#1A3A5A" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Desglose por Sede (1/3) */}
                {consolidatedData && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                        <h3 className="text-lg font-display font-bold text-brand-blue mb-4">Desglose por Sede</h3>
                        <div className="flex flex-col gap-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {consolidatedData.locationStats?.map((loc: any) => (
                                <div key={loc.locationId} className="border rounded-lg p-3 hover:bg-brand-blue/5 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-sm text-brand-blue truncate max-w-[120px]" title={loc.locationName}>{loc.locationName}</h4>
                                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                            {loc.transactionCount} Tx
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Ingresos:</span>
                                        <span className="font-bold text-brand-green">${loc.totalIncome.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                            {(!consolidatedData.locationStats || consolidatedData.locationStats.length === 0) && (
                                <p className="text-gray-400 text-sm text-center italic mt-10">No hay datos de sedes</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
