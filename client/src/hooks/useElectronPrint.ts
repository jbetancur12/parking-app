import { useCallback } from 'react';

interface UseElectronPrintOptions {
  contentRef: React.RefObject<HTMLElement | null>;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  silent?: boolean;
  deviceName?: string;
}

export const useElectronPrint = ({
  contentRef,
  onBeforePrint,
  onAfterPrint,
  silent = true,
  deviceName
}: UseElectronPrintOptions) => {
  const handlePrint = useCallback(async () => {
    if (!contentRef.current) {
      console.error('Print content ref is null');
      return;
    }

    onBeforePrint?.();

    // Copiar estilos de la aplicación (incluyendo Tailwind)
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    // Construir HTML completo para el worker window
    const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Ticket - Cuadra</title>
                    <style>
                        ${styles}
                        
                        /* Configuración para impresora térmica */
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        
                        @media print {
                            body {
                                width: 80mm;
                                margin: 0;
                                padding: 0;
                                background-color: white;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${contentRef.current.innerHTML}
                </body>
            </html>
        `;

    // Usar API de Electron si está disponible
    const electronAPI = (window as any).electronAPI;

    if (electronAPI?.print) {
      try {
        // Enviamos el contenido HTML al proceso principal para imprimir en una ventana oculta
        await electronAPI.print(htmlContent, { silent, deviceName });
      } catch (error) {
        console.error('Electron print failed:', error);

        // Fallback: iframe local (comportamiento legacy/navegador)
        printWithIframe(htmlContent);
      }
    } else {
      // Navegador web normal - usar iframe
      printWithIframe(htmlContent);
    }

    onAfterPrint?.();
  }, [contentRef, onBeforePrint, onAfterPrint, silent, deviceName]);

  return handlePrint;
};

// Helper para imprimir con iframe (fallback o navegador)
const printWithIframe = async (htmlContent: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    await new Promise(resolve => setTimeout(resolve, 250));
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }
};
