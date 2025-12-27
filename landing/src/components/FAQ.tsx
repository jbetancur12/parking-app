import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "¿Necesito instalar algo en mi computador?",
        answer: "No. Aparca funciona 100% en la nube desde tu navegador. Solo necesitas conexión a internet."
    },
    {
        question: "¿Puedo usar Aparca desde mi celular?",
        answer: "Sí, Aparca es completamente responsive y funciona perfecto en celulares y tablets."
    },
    {
        question: "¿Qué pasa si se va el internet?",
        answer: "Aparca tiene modo offline que te permite seguir operando. Los datos se sincronizan automáticamente cuando vuelve la conexión."
    },
    {
        question: "¿Cómo funciona la facturación electrónica?",
        answer: "Aparca se integra directamente con la DIAN. Generas facturas válidas con un solo clic, sin necesidad de software adicional."
    },
    {
        question: "¿Puedo migrar mis datos de otro sistema?",
        answer: "Sí, nuestro equipo te ayuda a migrar tus clientes mensuales y configuración sin costo adicional."
    },
    {
        question: "¿Hay límite de usuarios o tickets?",
        answer: "En el plan Pro no hay límites. Usuarios ilimitados y tickets ilimitados."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
                    <p className="text-xl text-gray-600">Todo lo que necesitas saber sobre Aparca</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-bold text-gray-900 pr-8">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-brand-blue flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-5 text-gray-600 animate-fade-in">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">¿No encuentras tu respuesta?</p>
                    <a href="#contact" className="text-brand-blue font-bold hover:underline">
                        Contáctanos directamente →
                    </a>
                </div>
            </div>
        </section>
    );
}
