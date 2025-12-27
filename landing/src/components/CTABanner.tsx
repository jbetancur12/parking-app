import { useState, useEffect } from 'react';
import { X, Rocket } from 'lucide-react';

export default function CTABanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show banner after scrolling 500px
            if (window.scrollY > 500 && !isDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white px-4 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <Rocket className="w-6 h-6 flex-shrink-0 hidden sm:block" />
                        <div>
                            <p className="font-bold text-sm sm:text-base">¿Listo para modernizar tu parqueadero?</p>
                            <p className="text-xs sm:text-sm text-blue-100">Prueba gratis por 14 días. Sin tarjeta de crédito.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="http://localhost:5173"
                            className="bg-brand-yellow text-brand-blue px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-yellow-400 transition-colors whitespace-nowrap"
                        >
                            Comenzar Gratis
                        </a>
                        <button
                            onClick={handleDismiss}
                            className="text-white/80 hover:text-white p-2"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
