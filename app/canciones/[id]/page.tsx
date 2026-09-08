import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import SongFilesList from '@/components/SongFilesList';
import { uploadFileForSongAction, deleteSong } from '../actions';
import { redirect } from 'next/navigation';

export default async function SongDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: song } = await supabase.from('songs').select('*').eq('id', params.id).single();
  const { data: files } = await supabase
    .from('song_files')
    .select('*')
    .eq('song_id', params.id)
    .order('created_at', { ascending: false });

  if (!song) {
    return (
      <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
        <p className="text-slate-500">Canción no encontrada.</p>
      </AppShell>
    );
  }

  async function handleUpload(formData: FormData) {
    'use server';
    formData.set('song_id', song.id);
    await uploadFileForSongAction(formData);
  }

  async function handleDelete() {
    'use server';
    await deleteSong(song.id);
    redirect('/canciones');
  }

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{song.title}</h1>
            <p className="text-slate-500">{song.artist_or_album}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {song.key_note && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 font-medium">
                  Tono {song.key_note}
                </span>
              )}
              {song.bpm && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-medium">
                  {song.bpm} BPM
                </span>
              )}
              {song.time_signature && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                  {song.time_signature}
                </span>
              )}
              {song.category && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                  {song.category}
                </span>
              )}
            </div>
          </div>
          {profile?.role === 'director' && (
            <form action={handleDelete}>
              <button className="text-sm text-red-500 hover:text-red-700 font-semibold">
                Eliminar canción
              </button>
            </form>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-3">Archivos</h2>
          <SongFilesList files={files ?? []} />

          {profile?.role === 'director' && (
            <form
              action={handleUpload}
              className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100"
            >
              <select
                name="file_type"
                defaultValue="partitura"
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
              >
                <option value="partitura">Partitura</option>
                <option value="cifrado">Cifrado</option>
                <option value="audio">Audio</option>
                <option value="otro">Otro</option>
              </select>
              <input name="file" type="file" required className="text-sm flex-1" />
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                Subir
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}

