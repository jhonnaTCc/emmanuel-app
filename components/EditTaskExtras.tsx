'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateTask, deleteTask } from '@/app/tareas/actions';
import { SONG_COLORS } from '@/lib/songColors';
import TaskCategorySelect from './TaskCategorySelect';

export default function EditTaskExtras({
  task,
  categories,
}: {
  task: any;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(task.color_tag ?? 'slate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set('task_id', task.id);
    formData.set('color_tag', color);
    try {
      await updateTask(formData);
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Seguro que quieres eliminar esta tarea? Se borrarán también las asignaciones.')) {
      return;
    }
    setLoading(true);
    try {
      await deleteTask(task.id);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Eliminar
        </button>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4"
    >
      <input
        name="title"
        required
        defaultValue={task.title}
        placeholder="Título de la tarea"
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
      />
      <textarea
        name="description"
        defaultValue={task.description ?? ''}
        placeholder="Descripción / instrucciones"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <TaskCategorySelect categories={categories} defaultValue={task.category ?? ''} />
        <input
          name="due_date"
          type="datetime-local"
          defaultValue={task.due_date ? task.due_date.slice(0, 16) : ''}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
        />
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
          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
