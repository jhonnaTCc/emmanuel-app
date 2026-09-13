'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSongExtras } from '@/app/canciones/actions';
import { SONG_COLORS } from '@/lib/songColors';

export default function EditSongExtras({ song }: { song: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(song.color_tag ?? 'slate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set('song_id', song.id);
    formData.set('color_tag', color);
    try {
      await updateSongExtras(formData);
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <span className="material-symbols-outlined text-[16px]">edit</span>
        Editar canción
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
            Título de la canción
          </label>
          <input
            name="title"
            required
            defaultValue={song.title}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
            Artista / Álbum
          </label>
          <input
            name="artist_or_album"
            defaultValue={song.artist_or_album ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Categoría</label>
          <select
            name="category"
            defaultValue={song.category ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          >
            <option value="">Sin categoría</option>
            <option>Apertura</option>
            <option>Alabanza</option>
            <option>Íntimo</option>
            <option>Ministración</option>
            <option>Salida</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
            Tono (ej. G, D)
          </label>
          <input
            name="key_note"
            defaultValue={song.key_note ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">BPM</label>
          <input
            name="bpm"
            type="number"
            defaultValue={song.bpm ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
            Compás (ej. 4/4)
          </label>
          <input
            name="time_signature"
            defaultValue={song.time_signature ?? ''}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
            Enlace de YouTube (tutorial o video de referencia)
          </label>
          <input
            name="youtube_url"
            defaultValue={song.youtube_url ?? ''}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
            Letra con acordes (formato ChordPro)
          </label>
          <textarea
            name="lyrics_chordpro"
            defaultValue={song.lyrics_chordpro ?? ''}
            rows={8}
            placeholder={
              '{verso: 1}\n[G]Cuán grande es [D]Él, cuán grande [G]es\n\n{coro}\n[C]Cuán grande es [G]Él...'
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Escribe el acorde entre corchetes justo antes de la sílaba, y usa {'{verso}'}, {'{coro}'} o {'{puente}'} en su propia línea para marcar las secciones.
          </p>
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
          Color de la tarjeta
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(SONG_COLORS).map(([key, val]) => (
            <button
              type="button"
              key={key}
              title={val.label}
              onClick={() => setColor(key)}
              className={`w-7 h-7 rounded-full ${val.swatch} border-2 transition-all ${
                color === key ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
