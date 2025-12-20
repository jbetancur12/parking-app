import { useCallback } from 'react';

interface UseElectronPrintOptions {
    contentRef: React.RefObject<HTMLElement | null>;
    onBeforePrint?: () => void;
    onAfterPrint?: () => void;
}

export const useElectronPrint = ({ contentRef, onBeforePrint, onAfterPrint }: UseElectronPrintOptions) => {
    const handlePrint = useCallback(async () => {
        if (!contentRef.current) {
            console.error('Print content ref is null');
            return;
        }

        onBeforePrint?.();

        // Crear iframe oculto para impresión
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            console.error('Could not access iframe document');
            document.body.removeChild(iframe);
            return;
        }

        // Copiar todos los estilos del documento principal
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    // External stylesheets might throw CORS errors
                    return '';
                }
            })
            .join('\n');

        // Escribir contenido al iframe
        iframeDoc.open();
        iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
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
              }
            }
          </style>
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);
        iframeDoc.close();

        // Esperar a que el contenido se cargue
        await new Promise(resolve => setTimeout(resolve, 250));

        // Enfocar el iframe para impresión
        iframe.contentWindow?.focus();

        // Usar API de Electron si está disponible, sino usar window.print
        const electronAPI = (window as any).electronAPI;

        if (electronAPI?.print) {
            try {
                await electronAPI.print();
            } catch (error) {
                console.error('Electron print failed:', error);
                // Fallback a window.print
                iframe.contentWindow?.print();
            }
        } else {
            // Navegador web normal
            iframe.contentWindow?.print();
        }

        onAfterPrint?.();

        // Limpiar el iframe después de un delay
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 1000);
    }, [contentRef, onBeforePrint, onAfterPrint]);

    return handlePrint;
};
