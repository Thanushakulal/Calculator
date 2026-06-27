import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('ai_calculator_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Helper to apply actual theme classes
    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      root.setAttribute('data-theme', resolvedTheme);
    };

    if (theme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
      const checkSystem = (e: MediaQueryListEvent | MediaQueryList) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      checkSystem(systemPreference);
      
      // Modern listener
      systemPreference.addEventListener('change', checkSystem);
      return () => {
        systemPreference.removeEventListener('change', checkSystem);
      };
    } else {
      applyTheme(theme);
    }
    
    try {
      localStorage.setItem('ai_calculator_theme', theme);
    } catch {}
  }, [theme]);

  return { theme, setTheme };
};
