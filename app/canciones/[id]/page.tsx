import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import SongFilesList from '@/components/SongFilesList';
import EditSongExtras from '@/components/EditSongExtras';
import LyricsChords from '@/components/LyricsChords';
import { uploadFileForSongAction, deleteSong } from '../actions';
import { getYouTubeEmbedId } from '@/lib/youtube';
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
        <p className="text-slate-500 dark:text-slate-400">Canción no encontrada.</p>
      </AppShell>
    );
  }

  const youtubeId = getYouTubeEmbedId(song.youtube_url);

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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white break-words">
              {song.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{song.artist_or_album}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {song.key_note && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-400/10 border border-amber-100 dark:border-amber-400/30 text-amber-700 dark:text-amber-400 font-medium">
                  Tono {song.key_note}
                </span>
              )}
              {song.bpm && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 font-medium">
                  {song.bpm} BPM
                </span>
              )}
              {song.time_signature && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  {song.time_signature}
                </span>
              )}
              {song.category && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                  {song.category}
                </span>
              )}
            </div>
          </div>
          {profile?.role === 'director' && (
            <form action={handleDelete} className="flex-shrink-0">
              <button className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold whitespace-nowrap">
                Eliminar canción
              </button>
            </form>
          )}
        </div>

        {/* Video de YouTube (tutorial / referencia) */}
        {youtubeId && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 dark:text-white mb-3">Video / Tutorial</h2>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Video de YouTube"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Letra con acordes y control de tonalidad */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">Letra y acordes</h2>
          <LyricsChords lyricsChordpro={song.lyrics_chordpro} originalKey={song.key_note} />
        </div>

        {profile?.role === 'director' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <EditSongExtras song={song} />
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">Archivos</h2>
          <SongFilesList files={files ?? []} />

          {profile?.role === 'director' && (
            <form
              action={handleUpload}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
            >
              <select
                name="file_type"
                defaultValue="partitura"
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm w-full sm:w-auto"
              >
                <option value="partitura">Partitura</option>
                <option value="cifrado">Cifrado</option>
                <option value="audio">Audio</option>
                <option value="otro">Otro</option>
              </select>
              <input
                name="file"
                type="file"
                required
                className="text-sm text-slate-700 dark:text-slate-300 w-full sm:flex-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 file:text-xs file:font-semibold"
              />
              <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold w-full sm:w-auto flex-shrink-0">
                Subir
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
