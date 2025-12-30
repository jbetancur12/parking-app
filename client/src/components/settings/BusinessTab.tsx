import React from 'react';
import { Building2, Upload } from 'lucide-react';

interface BusinessTabProps {
    settings: any;
    updateSetting: (key: string, value: any) => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({ settings, updateSetting }) => {

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateSetting('company_logo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegulationChange = (index: number, value: string) => {
        updateSetting(`regulation_text_${index + 1}`, value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Ticket Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Building2 className="mr-2 text-brand-blue" size={20} />
                    Información del Ticket
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                        <input
                            type="text"
                            value={settings.company_name || ''}
                            onChange={(e) => updateSetting('company_name', e.target.value)}
                            className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIT / Razón Social</label>
                        <input
                            type="text"
                            value={settings.company_nit || ''}
                            onChange={(e) => updateSetting('company_nit', e.target.value)}
                            className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                            type="text"
                            value={settings.company_address || ''}
                            onChange={(e) => updateSetting('company_address', e.target.value)}
                            className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={settings.company_phone || ''}
                            onChange={(e) => updateSetting('company_phone', e.target.value)}
                            className="w-full border rounded-md px-3 py-2 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo del Ticket</label>
                        <div className="flex items-center space-x-4">
                            {settings.company_logo && (
                                <img
                                    src={settings.company_logo}
                                    alt="Logo preview"
                                    className="h-16 w-16 object-contain border rounded-lg bg-white"
                                />
                            )}
                            <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center">
                                <Upload size={18} className="mr-2" />
                                Subir Imagen
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regulations */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Reglamento (Aparece en Ticket)</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                        <div key={num} className="flex items-start">
                            <span className="text-gray-400 font-bold mr-3 mt-2">{num}.</span>
                            <textarea
                                value={settings[`regulation_text_${num}`] || ''}
                                onChange={(e) => handleRegulationChange(num - 1, e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors resize-none"
                                rows={2}
                                placeholder={`Regla ${num}...`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
