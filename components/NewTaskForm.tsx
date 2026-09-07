'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTask } from '@/app/tareas/actions';

export default function NewTaskForm({
  members,
  songs,
}: {
  members: { id: string; full_name: string; instrument: string | null }[];
  songs: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createTask(formData);
      router.push('/tareas');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <input
        name="title"
        required
        placeholder="Título de la tarea"
        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
      />
      <textarea
        name="description"
        placeholder="Descripción / instrucciones"
        rows={3}
        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          name="category"
          defaultValue=""
          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        >
          <option value="">Categoría</option>
          <option>Músicos & Ensayo</option>
          <option>Vocalistas & Armonías</option>
          <option>Audio & Multimedia</option>
        </select>
        <input
          name="due_date"
          type="datetime-local"
          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
        />
      </div>
      <select
        name="song_id"
        defaultValue=""
        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
      >
        <option value="">Relacionar con una canción (opcional)</option>
        {songs.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">
          Archivo de referencia (audio guía, PDF...)
        </label>
        <input name="reference_file" type="file" className="text-sm" />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2">Asignar a:</p>
        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto border border-slate-100 rounded-lg p-3">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="assigned_user_id" value={m.id} />
              {m.full_name} {m.instrument ? `(${m.instrument})` : ''}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="self-start px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-60"
      >
        {loading ? 'Creando...' : 'Crear y Asignar Tarea'}
      </button>
    </form>
  );
}
