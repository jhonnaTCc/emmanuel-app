'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/lib/theme/ThemeProvider';

const links = [
  { href: '/dashboard', label: 'Inicio / Culto Dominical', icon: 'church' },
  { href: '/canciones', label: 'Canciones & Álbumes', icon: 'queue_music' },
  { href: '/setlist', label: 'Repertorio Dominical', icon: 'event' },
  { href: '/tareas', label: 'Tareas Semanales', icon: 'task_alt' },
  { href: '/equipo', label: 'Equipo', icon: 'groups' },
];

export default function Sidebar({
  fullName,
  role,
}: {
  fullName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Barra superior visible solo en móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Emmanuel</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Fondo oscuro al abrir el menú en móvil */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Barra lateral: fija en escritorio, deslizante en móvil */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col justify-between shadow-sm transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col overflow-y-auto">
          <div className="h-16 md:h-20 px-4 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                E
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 dark:text-white truncate leading-none">Emmanuel</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mt-1">
                  Ministerio de Alabanza
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-3 mt-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {/* Interruptor de modo oscuro/claro, afecta a toda la app */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
            </span>
            <span
              className={`w-9 h-5 rounded-full relative transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {fullName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{fullName}</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold capitalize truncate">
                  {role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
