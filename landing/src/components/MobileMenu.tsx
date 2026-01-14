import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuProps {
    appUrl: string;
}

export default function MobileMenu({ appUrl }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-600 hover:text-brand-blue p-2"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 animate-slide-in-right">
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-600 hover:text-brand-blue"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-6">
                            <a
                                href="#features"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-700 hover:text-brand-blue transition-colors"
                            >
                                Características
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-700 hover:text-brand-blue transition-colors"
                            >
                                Cómo Funciona
                            </a>
                            <a
                                href="#pricing"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-700 hover:text-brand-blue transition-colors"
                            >
                                Precios
                            </a>
                            <a
                                href="#testimonials"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-700 hover:text-brand-blue transition-colors"
                            >
                                Clientes
                            </a>
                            <a
                                href="#faq"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-700 hover:text-brand-blue transition-colors"
                            >
                                FAQ
                            </a>
                            <a
                                href="#contact"
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-medium text-gray-700 hover:text-brand-blue transition-colors"
                            >
                                Contacto
                            </a>
                            <div className="pt-6 border-t border-gray-200">
                                <a
                                    href={appUrl}
                                    className="block w-full text-center bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors"
                                >
                                    Ingresar
                                </a>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
