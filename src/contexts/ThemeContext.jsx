import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('aiguessr-theme');
    if (stored) return stored;
    // Papier par défaut : c'est le mode lisible au vidéoprojecteur en salle éclairée
    return 'light';
  });

  // Appliquer la classe dark sur <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aiguessr-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const isDark = theme === 'dark';

  const value = useMemo(() => ({
    theme,
    isDark,
    setTheme,
    toggleTheme
  }), [theme, isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: 'light', isDark: false, setTheme: () => {}, toggleTheme: () => {} };
  }
  return ctx;
}
