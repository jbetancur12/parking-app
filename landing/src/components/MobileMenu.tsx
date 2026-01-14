import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileMenuProps {
    appUrl: string;
}

export default function MobileMenu({ appUrl }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const trigger = document.getElementById('mobile-menu-trigger');
        const handleClick = () => setIsOpen(true);

        if (trigger) {
            trigger.addEventListener('click', handleClick);
        }

        return () => {
            if (trigger) {
                trigger.removeEventListener('click', handleClick);
            }
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[61]"
                onClick={() => setIsOpen(false)}
            />
            <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 animate-slide-in-right z-[62]">
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
    );
}
