import React from 'react';
import type { Tenant } from '../../../hooks/useTenantDetail';

interface TenantInfoTabProps {
    tenant: Tenant;
    openPlanModal: () => void;
}

export const TenantInfoTab: React.FC<TenantInfoTabProps> = ({ tenant, openPlanModal }) => {
    return (
        <dl className="grid grid-cols-2 gap-6">
            <div>
                <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Plan Actual</dt>
                <dd className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase
                        ${tenant.plan === 'enterprise' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            tenant.plan === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {tenant.plan}
                    </span>
                    <button
                        onClick={openPlanModal}
                        className="text-xs text-brand-blue dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-semibold transition-colors"
                    >
                        Cambiar Plan
                    </button>
                </dd>
            </div>
            <div>
                <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Estado</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full
                        ${tenant.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        {tenant.status}
                    </span>
                </dd>
            </div>
            <div>
                <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Email de Contacto</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{tenant.contactEmail || '-'}</dd>
            </div>
            <div>
                <dt className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Fecha de Creación</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                </dd>
            </div>
        </dl>
    );
};
