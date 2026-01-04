import { useEffect } from 'react';

interface UseAutoLogoutProps {
    onLogout: () => void;
    timeoutMs?: number;
}

export const useAutoLogout = ({ onLogout, timeoutMs = 60 * 60 * 1000 }: UseAutoLogoutProps) => {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                console.log('[Auth] User inactive for 1 hour. Logging out.');
                onLogout();
            }, timeoutMs);
        };

        // Listeners for activity
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);

        // Init timer
        resetTimer();

        return () => {
            if (timer) clearTimeout(timer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
        };
    }, [onLogout, timeoutMs]);
};
