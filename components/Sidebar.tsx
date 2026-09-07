'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between shadow-sm">
      <div className="flex flex-col">
        <div className="h-20 px-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            E
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 truncate leading-none">Emmanuel</span>
            <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mt-1">
              Ministerio de Alabanza
            </span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3 mt-2">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              {fullName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{fullName}</span>
              <span className="text-[11px] text-blue-600 font-semibold capitalize truncate">
                {role}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
