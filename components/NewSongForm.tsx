'use client';

import { useRef, useState } from 'react';
import { createSong } from '@/app/canciones/actions';
import { SONG_COLORS } from '@/lib/songColors';

export default function NewSongForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState('slate');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set('color_tag', color);
    try {
      await createSong(formData);
      formRef.current?.reset();
      setColor('slate');
      setOpen(false);
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
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Agregar Canción
      </button>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Nueva canción</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-700 text-sm"
        >
          Cancelar
        </button>
      </div>
      <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          name="title"
          required
          placeholder="Título de la canción"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm md:col-span-2"
        />
        <input
          name="artist_or_album"
          placeholder="Artista / Álbum"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        />
        <input
          name="key_note"
          placeholder="Tono (ej. G, D)"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        />
        <input
          name="bpm"
          type="number"
          placeholder="BPM"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        />
        <input
          name="time_signature"
          placeholder="Compás (ej. 4/4)"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        />
        <select
          name="category"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
          defaultValue=""
        >
          <option value="">Categoría (opcional)</option>
          <option>Apertura</option>
          <option>Alabanza</option>
          <option>Íntimo</option>
          <option>Ministración</option>
          <option>Salida</option>
        </select>
        <input
          name="youtube_url"
          placeholder="Enlace de YouTube (opcional)"
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm md:col-span-3"
        />

        <div className="md:col-span-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-500">Color de la tarjeta</span>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(SONG_COLORS).map(([key, val]) => (
              <button
                type="button"
                key={key}
                title={val.label}
                onClick={() => setColor(key)}
                className={`w-7 h-7 rounded-full ${val.swatch} border-2 transition-all ${
                  color === key ? 'border-slate-800 scale-110' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-3 flex items-center gap-3 border-t border-slate-100 pt-3">
          <select
            name="file_type"
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
            defaultValue="partitura"
          >
            <option value="partitura">Partitura</option>
            <option value="cifrado">Cifrado</option>
            <option value="audio">Audio</option>
            <option value="otro">Otro</option>
          </select>
          <input
            name="file"
            type="file"
            accept=".pdf,.mp3,.wav,.m4a,image/*"
            className="text-sm flex-1"
          />
        </div>

        {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-3 mt-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar canción'}
        </button>
      </form>
    </div>
  );
}
