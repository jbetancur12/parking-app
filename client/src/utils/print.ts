// Utility to handle printing in both browser and Electron environments
export const handlePrint = async () => {
    // Check if running in Electron
    if ((window as any).electronAPI?.print) {
        try {
            await (window as any).electronAPI.print();
        } catch (error) {
            console.error('Electron print failed:', error);
            // Fallback to browser print
            window.print();
        }
    } else {
        // Browser environment
        window.print();
    }
};
