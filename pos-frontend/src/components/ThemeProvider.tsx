'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, resolvedTheme, setTheme } = useThemeStore();

    // Apply theme class to <html>
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);

        // Update meta theme-color for mobile browsers
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', resolvedTheme === 'dark' ? '#0a0a0f' : '#f1f3f8');
        }
    }, [resolvedTheme]);

    // Listen for system preference changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setTheme('system'); // Re-resolve

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme, setTheme]);

    // Prevent flash of wrong theme — apply immediately
    useEffect(() => {
        const stored = localStorage.getItem('pos-theme') as 'light' | 'dark' | 'system' | null;
        if (stored) {
            const root = document.documentElement;
            let resolved = stored;
            if (stored === 'system') {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            root.classList.add(resolved);
        }
    }, []);

    return <>{children}</>;
}
