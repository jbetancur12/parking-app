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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 rounded-full p-2 transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-4">
                            <video
                                src="/demo-video.webp"
                                controls
                                autoPlay
                                className="w-full h-auto rounded-lg"
                            >
                                Tu navegador no soporta el elemento de video.
                            </video>
                        </div>

                        <div className="px-6 pb-6">
                            <h3 className="text-white font-bold text-xl mb-2">Demo de Aparca</h3>
                            <p className="text-gray-400 text-sm">
                                Mira cómo funciona Aparca en acción: desde abrir turno hasta generar reportes.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
