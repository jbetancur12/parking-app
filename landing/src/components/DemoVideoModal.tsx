import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function DemoVideoModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const trigger = document.getElementById('demo-video-trigger');
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
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="relative w-full max-w-6xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/70 hover:bg-black rounded-full p-3 transition-all"
                    aria-label="Cerrar"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="aspect-video bg-black">
                    <video
                        src="/demo-video.webp"
                        controls
                        autoPlay
                        className="w-full h-full"
                    >
                        Tu navegador no soporta el elemento de video.
                    </video>
                </div>

                <div className="px-6 py-4 bg-gray-800">
                    <h3 className="text-white font-bold text-lg mb-1">Demo de Aparca en Acción</h3>
                    <p className="text-gray-400 text-sm">
                        Mira el flujo completo: abrir turno, registrar vehículos, gestionar clientes y generar reportes.
                    </p>
                </div>
            </div>
        </div>
    );
}
