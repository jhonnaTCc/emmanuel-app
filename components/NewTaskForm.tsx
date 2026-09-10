'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTask } from '@/app/tareas/actions';
import { SONG_COLORS } from '@/lib/songColors';
import TaskCategorySelect from './TaskCategorySelect';

export default function NewTaskForm({
  members,
  songs,
  categories,
}: {
  members: { id: string; full_name: string; instrument: string | null }[];
  songs: { id: string; title: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState('slate');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set('color_tag', color);
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
        <TaskCategorySelect categories={categories} />
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
        <span className="text-xs font-semibold text-slate-500 mb-1 block">
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
                color === key ? 'border-slate-800 scale-110' : 'border-transparent'
              }`}
            />
          ))}
        </div>
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
