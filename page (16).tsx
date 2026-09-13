import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import { songColorClasses } from '@/lib/songColors';
import Link from 'next/link';

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  // Próximo domingo con setlist (fecha >= hoy), el más cercano
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: setlist }, { count: pendingTasksCount }] = await Promise.all([
    supabase
      .from('setlists')
      .select('*, setlist_songs(*, songs(*))')
      .gte('service_date', today)
      .order('service_date', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('task_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile?.id)
      .neq('status', 'completada'),
  ]);

  const songs = (setlist?.setlist_songs ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
              {setlist ? 'En directo próximo domingo' : 'Sin servicio programado'}
            </p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {setlist?.title ?? 'Aún no hay un repertorio para el próximo domingo'}
            </h1>
            {setlist && (
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {new Date(setlist.service_date + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                • {setlist.service_time} • {setlist.location} • {songs.length} canciones
              </p>
            )}
          </div>
          {profile?.role === 'director' && (
            <Link
              href="/setlist"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
              {setlist ? 'Editar Repertorio' : 'Crear Repertorio del Domingo'}
            </Link>
          )}
        </div>

        {songs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {songs.map((item: any) => (
              <div
                key={item.id}
                className={`flex flex-col rounded-xl p-3 border shadow-sm ${songColorClasses(
                  item.songs.color_tag
                )}`}
              >
                {item.section_label && (
                  <span className="self-start mb-2 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                    {item.section_label}
                  </span>
                )}
                <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.songs.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.songs.artist_or_album}</p>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  {item.songs.key_note && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 font-bold">
                      TONO: {item.songs.key_note}
                    </span>
                  )}
                  {item.songs.bpm && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 font-semibold">
                      {item.songs.bpm} BPM
                    </span>
                  )}
                </div>
                <Link
                  href={`/canciones/${item.songs.id}`}
                  className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  Ver partitura →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/tareas"
            className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tareas pendientes para ti</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingTasksCount ?? 0}</p>
            </div>
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[32px]">
              task_alt
            </span>
          </Link>
          <Link
            href="/canciones"
            className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all"
          >
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ir al cancionero completo</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ver todas</p>
            </div>
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[32px]">
              queue_music
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
