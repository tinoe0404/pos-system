'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): ResolvedTheme => {
    if (theme === 'system') return getSystemTheme();
    return theme;
};

const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('pos-theme') as Theme) || 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'dark',
    resolvedTheme: 'dark',

    setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        localStorage.setItem('pos-theme', theme);
        set({ theme, resolvedTheme: resolved });
    },

    toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
    },
}));

// Initialize from localStorage on first client-side load
if (typeof window !== 'undefined') {
    const stored = getStoredTheme();
    const resolved = resolveTheme(stored);
    useThemeStore.setState({ theme: stored, resolvedTheme: resolved });
}
