'use client';

// lib/theme/ThemeProvider.tsx
// Contexto global de modo oscuro/claro. Guarda la preferencia en localStorage
// y agrega/quita la clase "dark" en <html>, que es lo que activa todas las
// clases dark:... de Tailwind en toda la aplicación.

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Al montar, toma la preferencia guardada (el script en layout.tsx ya
  // aplicó la clase antes de pintar la página, así que aquí solo sincronizamos el estado de React)
  useEffect(() => {
    const stored = window.localStorage.getItem('emmanuel-theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    }
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('emmanuel-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return ctx;
}
