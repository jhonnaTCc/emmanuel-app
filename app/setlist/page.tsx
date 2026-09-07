import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import SetlistEditor from '@/components/SetlistEditor';
import Link from 'next/link';

export default async function SetlistPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: songs } = await supabase
    .from('songs')
    .select('id, title, artist_or_album, key_note')
    .order('title');

  const { data: allSetlists } = await supabase
    .from('setlists')
    .select('id, service_date, title')
    .order('service_date', { ascending: false })
    .limit(12);

  const nextSunday = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = (7 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  })();

  const targetDate = searchParams.date ?? nextSunday;

  const { data: existing } = await supabase
    .from('setlists')
    .select('*, setlist_songs(*)')
    .eq('service_date', targetDate)
    .maybeSingle();

  if (profile?.role !== 'director') {
    return (
      <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
        <p className="text-slate-500">Solo el director puede editar el repertorio.</p>
      </AppShell>
    );
  }

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
              Planificación
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Repertorio Dominical</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(allSetlists ?? []).map((s: any) => (
              <Link
                key={s.id}
                href={`/setlist?date=${s.service_date}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  s.service_date === targetDate
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {new Date(s.service_date + 'T00:00:00').toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Link>
            ))}
          </div>
        </div>

        <SetlistEditor
          songs={songs ?? []}
          initialDate={targetDate}
          initialTime={existing?.service_time ?? '10:00 AM'}
          initialLocation={existing?.location ?? 'Auditorio Principal'}
          initialTitle={existing?.title ?? 'Repertorio Oficial del Servicio'}
          initialItems={existing?.setlist_songs ?? []}
        />
      </div>
    </AppShell>
  );
}
