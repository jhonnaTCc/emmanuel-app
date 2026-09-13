import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'Emmanuel — Ministerio de Alabanza',
  description: 'Repertorio, tareas y equipo del ministerio de alabanza',
};

// Este script corre antes de que React pinte la página, para aplicar
// el modo oscuro guardado sin que se vea un parpadeo blanco al cargar.
const themeInitScript = `
  try {
    const saved = localStorage.getItem('emmanuel-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
