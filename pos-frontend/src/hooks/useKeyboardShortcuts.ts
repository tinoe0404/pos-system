import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      for (const [combo, action] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const needsCtrl = parts.includes('ctrl') || parts.includes('meta');
        const needsShift = parts.includes('shift');

        const keyMatch = e.key.toLowerCase() === key || e.code.toLowerCase() === key;
        const ctrlMatch = needsCtrl ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = needsShift ? e.shiftKey : true;

        if (keyMatch && ctrlMatch && shiftMatch) {
          // Allow Escape and function keys even when in input
          if (isInput && key !== 'escape' && !key.startsWith('f')) {
            continue;
          }
          e.preventDefault();
          action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
