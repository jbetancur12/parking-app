import { useState } from 'react';
import { Play, X } from 'lucide-react';

export default function DemoVideoModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 text-brand-blue font-bold hover:text-blue-700 transition-colors"
            >
                <Play className="w-5 h-5" />
                Ver Demo
            </button>

            {isOpen && (
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
            )}
        </>
    );
}
