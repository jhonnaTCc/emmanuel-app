'use client';

import { useRef, useState } from 'react';
import { createSong } from '@/app/canciones/actions';

export default function NewSongForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createSong(formData);
      formRef.current?.reset();
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
          className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm md:col-span-3"
          defaultValue=""
        >
          <option value="">Categoría (opcional)</option>
          <option>Apertura</option>
          <option>Alabanza</option>
          <option>Íntimo</option>
          <option>Ministración</option>
          <option>Salida</option>
        </select>

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
