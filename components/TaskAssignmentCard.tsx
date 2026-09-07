'use client';

import { useState } from 'react';
import { updateAssignmentStatus } from '@/app/tareas/actions';

const statusStyles: Record<string, string> = {
  pendiente: 'bg-slate-100 text-slate-600',
  en_progreso: 'bg-amber-50 text-amber-700 border border-amber-200',
  completada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
};

export default function TaskAssignmentCard({ assignment, task }: { assignment: any; task: any }) {
  const [status, setStatus] = useState(assignment.status);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set('assignment_id', assignment.id);
    formData.set('status', status);
    try {
      await updateAssignmentStatus(formData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          {task.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {task.category}
            </span>
          )}
          <h3 className="font-bold text-slate-900 mt-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
          )}
          {task.due_date && (
            <p className="text-xs text-slate-400 mt-2">
              Vence: {new Date(task.due_date).toLocaleString('es-ES')}
            </p>
          )}
          {task.reference_file_url && (
            <a
              href={task.reference_file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2"
            >
              <span className="material-symbols-outlined text-[14px]">attach_file</span>
              {task.reference_file_name}
            </a>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
          <input
            name="submission_file"
            type="file"
            className="text-xs flex-1"
            title="Subir audio/video de práctica (opcional)"
          />
        </div>
        <textarea
          name="submission_note"
          defaultValue={assignment.submission_note ?? ''}
          placeholder="Nota (opcional)"
          rows={2}
          className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
        />
        <button
          disabled={loading}
          className="self-start px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Actualizar'}
        </button>
      </form>
    </div>
  );
}
