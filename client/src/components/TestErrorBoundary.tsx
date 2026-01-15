import { useState, useEffect } from 'react';

/**
 * Test component to trigger Error Boundary
 * Add this button to any page to test Error Boundary functionality
 * 
 * Usage:
 * import TestErrorBoundary from '@/components/TestErrorBoundary';
 * <TestErrorBoundary />
 */
export default function TestErrorBoundary() {
    const [shouldThrow, setShouldThrow] = useState(false);

    if (shouldThrow) {
        throw new Error('🧪 Test Error - Error Boundary is working!');
    }
    // Check for URL param ?debug=true
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('debug') === 'true') {
            localStorage.setItem('ENABLE_TEST_ERROR', 'true');
            // Remove param from URL without refresh to clean up
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({ path: newUrl }, '', newUrl);
            // Force re-render not needed as we read from localStorage in next render cycle or reload, 
            // but for immediate reaction we can force update or rely on user reload. 
            // Better: just use state for visibility that defaults to localStorage logic.
            setIsVisible(true);
        }

        // Expose global debug functions
        (window as any).enableDebug = () => {
            localStorage.setItem('ENABLE_TEST_ERROR', 'true');
            setIsVisible(true);
            console.log('✅ Debug mode enabled. You can now see the Test Error button.');
        };

        (window as any).disableDebug = () => {
            localStorage.removeItem('ENABLE_TEST_ERROR');
            setIsVisible(false);
            console.log('❌ Debug mode disabled.');
        };
    }, []);

    const [isVisible, setIsVisible] = useState(() => {
        return import.meta.env.DEV || localStorage.getItem('ENABLE_TEST_ERROR') === 'true';
    });

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={() => setShouldThrow(true)}
            className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 font-bold z-50"
        >
            🧪 Test Error Boundary
        </button>
    );
}
