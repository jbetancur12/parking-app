import { useCallback } from 'react';

interface UsePrintOptions {
    contentRef: React.RefObject<HTMLElement>;
}

export const usePrint = ({ contentRef }: UsePrintOptions) => {
    const handlePrint = useCallback(async () => {
        if (!contentRef.current) {
            console.error('Print content ref is null');
            return;
        }

        // Get the HTML content to print
        const printContent = contentRef.current.innerHTML;

        // Create a hidden iframe for printing
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

        // Copy styles from parent document
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

        // Write content to iframe
        iframeDoc.open();
        iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${styles}</style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
        iframeDoc.close();

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 250));

        // Check if running in Electron
        const electronAPI = (window as any).electronAPI;

        if (electronAPI?.print) {
            // Use Electron's print API
            try {
                // Focus the iframe window for printing
                iframe.contentWindow?.focus();
                await electronAPI.print();
            } catch (error) {
                console.error('Electron print failed:', error);
            }
        } else {
            // Use browser print
            iframe.contentWindow?.print();
        }

        // Clean up after a delay
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, [contentRef]);

    return handlePrint;
};
