'use client';

import { useMemo, useState } from 'react';
import { saveSetlist } from '@/app/setlist/actions';
import { useRouter } from 'next/navigation';

type Song = { id: string; title: string; artist_or_album: string; key_note: string };
type ExistingItem = { song_id: string; position: number; section_label: string | null };

export default function SetlistEditor({
  songs,
  initialDate,
  initialTime,
  initialLocation,
  initialTitle,
  initialItems,
}: {
  songs: Song[];
  initialDate: string;
  initialTime: string;
  initialLocation: string;
  initialTitle: string;
  initialItems: ExistingItem[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // orden: array de { song_id, section_label }
  const [selected, setSelected] = useState<{ song_id: string; section_label: string }[]>(
    initialItems
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ song_id: i.song_id, section_label: i.section_label ?? '' }))
  );

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.song_id)), [selected]);

  function toggleSong(songId: string) {
    setSelected((prev) =>
      prev.some((s) => s.song_id === songId)
        ? prev.filter((s) => s.song_id !== songId)
        : [...prev, { song_id: songId, section_label: '' }]
    );
  }

  function updateLabel(songId: string, label: string) {
    setSelected((prev) =>
      prev.map((s) => (s.song_id === songId ? { ...s, section_label: label } : s))
    );
  }

  function move(index: number, dir: -1 | 1) {
    setSelected((prev) => {
      const copy = [...prev];
      const target = index + dir;
      if (target < 0 || target >= copy.length) return prev;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    selected.forEach((s, idx) => {
      formData.append('song_entry', `${s.song_id}::${idx + 1}::${s.section_label}`);
    });
    try {
      await saveSetlist(formData);
      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          name="service_date"
          type="date"
          required
          defaultValue={initialDate}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
        />
        <input
          name="service_time"
          defaultValue={initialTime}
          placeholder="Hora (ej. 10:00 AM)"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
        />
        <input
          name="location"
          defaultValue={initialLocation}
          placeholder="Lugar"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
        />
        <input
          name="title"
          defaultValue={initialTitle}
          placeholder="Título del repertorio"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Cancionero — selecciona canciones</h3>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
            {songs.map((song) => (
              <label
                key={song.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedIds.has(song.id)
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(song.id)}
                  onChange={() => toggleSong(song.id)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{song.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{song.artist_or_album}</p>
                </div>
                {song.key_note && (
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-bold">{song.key_note}</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">
            Orden del repertorio ({selected.length})
          </h3>
          <div className="flex flex-col gap-2">
            {selected.map((item, idx) => {
              const song = songs.find((s) => s.id === item.song_id);
              return (
                <div
                  key={item.song_id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {song?.title}
                    </p>
                  </div>
                  <input
                    placeholder="Sección (ej. APERTURA)"
                    value={item.section_label}
                    onChange={(e) => updateLabel(item.song_id, e.target.value)}
                    className="w-36 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-800"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-800"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                </div>
              );
            })}
            {selected.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Selecciona canciones de la izquierda para armar el repertorio.
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm disabled:opacity-60"
      >
        {loading ? 'Guardando...' : 'Guardar Repertorio'}
      </button>
    </form>
  );
}
