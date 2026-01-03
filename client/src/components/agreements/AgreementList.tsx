
import React from 'react';
import type { Agreement } from '../../hooks/useAgreementsPage';
import { Power } from 'lucide-react';

interface AgreementListProps {
    agreements: Agreement[];
    onToggleStatus: (id: number) => void;
}

export const AgreementList: React.FC<AgreementListProps> = ({ agreements, onToggleStatus }) => {
    const getTypeValueLabel = (type: string, value: number) => {
        switch (type) {
            case 'FREE_HOURS':
                return `${value} Hora(s) Gratis`;
            case 'PERCENTAGE':
                return `${value}% Desc.`;
            case 'FLAT_DISCOUNT':
                return `$${value} Desc.`;
            default:
                return value;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {agreements.map((agreement) => (
                        <tr key={agreement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {agreement.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                {getTypeValueLabel(agreement.type, agreement.value)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                {agreement.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${agreement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {agreement.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onToggleStatus(agreement.id)}
                                    className={`text-sm font-medium ${agreement.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                    title={agreement.isActive ? 'Desactivar' : 'Activar'}
                                >
                                    <Power size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
