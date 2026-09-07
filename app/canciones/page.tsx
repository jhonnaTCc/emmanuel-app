import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import NewSongForm from '@/components/NewSongForm';
import Link from 'next/link';

export default async function CancionesPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: songs } = await supabase
    .from('songs')
    .select('*, song_files(count)')
    .order('created_at', { ascending: false });

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
              Repertorio & Temas
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Cancionero</h1>
          </div>
          {profile?.role === 'director' && <NewSongForm />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(songs ?? []).map((song: any) => (
            <Link
              key={song.id}
              href={`/canciones/${song.id}`}
              className="flex flex-col bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-slate-900 leading-tight">{song.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{song.artist_or_album}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {song.category && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-medium">
                    {song.category}
                  </span>
                )}
                {song.key_note && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 font-medium">
                    Tono {song.key_note}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                {song.song_files?.[0]?.count ?? 0} archivo(s) adjunto(s)
              </p>
            </Link>
          ))}
          {(!songs || songs.length === 0) && (
            <p className="text-slate-400 text-sm col-span-full">
              Aún no hay canciones en el cancionero.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
