import { useState } from 'react';

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
        // Intentionally throw error to test Error Boundary
        throw new Error('🧪 Test Error - Error Boundary is working!');
    }

    // Only show in development OR if manually enabled via localStorage
    const isDev = import.meta.env.DEV;
    const isManuallyEnabled = localStorage.getItem('ENABLE_TEST_ERROR') === 'true';

    if (!isDev && !isManuallyEnabled) {
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
