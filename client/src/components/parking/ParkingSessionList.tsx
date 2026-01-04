import React from 'react';
import { Car, Bike, Truck, Printer, X } from 'lucide-react';
import { Skeleton } from '../Skeleton';

interface ParkingSession {
    id: number;
    plate: string;
    vehicleType: string;
    entryTime: string;
    planType?: string;
}

interface ParkingSessionListProps {
    sessions: ParkingSession[];
    loading: boolean;
    searchTerm: string;
    getPlanLabel: (session: ParkingSession) => string;
    onReprint: (session: ParkingSession) => void;
    onExit: (plate: string) => void;
}

export const ParkingSessionList: React.FC<ParkingSessionListProps> = ({
    sessions,
    loading,
    searchTerm,
    getPlanLabel,
    onReprint,
    onExit
}) => {
    if (loading) {
        return (
            <>
                <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora Entrada</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-16 rounded-full" /><Skeleton className="h-8 w-16 rounded-full" /></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Skeleton */}
                <div className="md:hidden space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col gap-3">
                            <div className="flex justify-between">
                                <div className="flex gap-3">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <div>
                                        <Skeleton className="h-6 w-24 mb-1" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-12 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mt-2" />
                            <div className="grid grid-cols-2 gap-3 mt-1">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehículo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Placa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sessions.map((session) => (
                                <tr key={session.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="flex items-center">
                                            {session.vehicleType === 'CAR' ? <Car size={18} className="mr-2 text-gray-500 dark:text-gray-400" /> :
                                                session.vehicleType === 'MOTORCYCLE' ? <Bike size={18} className="mr-2 text-gray-500 dark:text-gray-400" /> :
                                                    <Truck size={18} className="mr-2 text-gray-500 dark:text-gray-400" />}
                                            <span className="text-gray-900 dark:text-gray-300">
                                                {session.vehicleType === 'CAR' ? 'CARRO' : session.vehicleType === 'MOTORCYCLE' ? 'MOTO' : 'OTRO'}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                        {session.plate} {session.id === -1 ? <span className="text-red-500 text-xs">(Offline)</span> : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                        {new Date(session.entryTime).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.planType === 'DAY' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                            {getPlanLabel(session)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onReprint(session)}
                                                className="text-brand-blue dark:text-blue-300 hover:text-blue-900 dark:hover:text-white bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors"
                                                title="Reimprimir ticket"
                                            >
                                                <Printer size={14} />
                                                Ticket
                                            </button>
                                            <button
                                                onClick={() => onExit(session.plate)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 text-xs px-3 py-1 rounded-full font-medium"
                                                data-testid="btn-request-exit"
                                            >
                                                Salida
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'No se encontraron vehículos con esa placa.' : 'No hay vehículos activos.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {sessions.map((session) => (
                    <div key={session.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                {session.vehicleType === 'CAR' ? <Car className="text-blue-500" size={24} /> :
                                    session.vehicleType === 'MOTORCYCLE' ? <Bike className="text-orange-500" size={24} /> :
                                        <Truck className="text-gray-500" size={24} />}

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {session.plate}
                                        {session.id === -1 && <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Offline</span>}
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{session.vehicleType === 'CAR' ? 'Carro' : session.vehicleType === 'MOTORCYCLE' ? 'Moto' : 'Otro'}</span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${session.planType === 'DAY' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                {getPlanLabel(session).replace('Por ', '')}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-2 mt-1">
                            <div className="flex justify-between">
                                <span>Entrada:</span>
                                <span className="font-medium">{new Date(session.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button
                                onClick={() => onReprint(session)}
                                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 py-2 rounded-lg font-medium text-sm active:bg-gray-200 dark:active:bg-gray-600"
                            >
                                <Printer size={16} /> Ticket
                            </button>
                            <button
                                onClick={() => onExit(session.plate)}
                                className="flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 rounded-lg font-medium text-sm active:bg-red-200"
                                data-testid="btn-request-exit"
                            >
                                <X size={16} /> Salida
                            </button>
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Car size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p>{searchTerm ? 'No se encontraron vehículos.' : 'No hay vehículos activos.'}</p>
                    </div>
                )}
            </div>
        </>
    );
};
