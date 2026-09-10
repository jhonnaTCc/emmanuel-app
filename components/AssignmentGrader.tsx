'use client';

import { useState } from 'react';
import { gradeAssignment } from '@/app/tareas/actions';

const statusStyles: Record<string, string> = {
  pendiente: 'bg-slate-100 text-slate-500',
  en_progreso: 'bg-amber-50 text-amber-700',
  completada: 'bg-emerald-50 text-emerald-700',
};

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completada: 'Completada',
};

export default function AssignmentGrader({ assignment }: { assignment: any }) {
  const [grade, setGrade] = useState(
    assignment.grade === null || assignment.grade === undefined ? '' : String(assignment.grade)
  );
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set('assignment_id', assignment.id);
    formData.set('grade', grade);
    try {
      await gradeAssignment(formData);
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between text-sm gap-2">
        <span className="text-slate-700 min-w-0 truncate">
          {assignment.profiles?.full_name}{' '}
          <span className="text-slate-400 text-xs">
            {assignment.profiles?.instrument ? `· ${assignment.profiles.instrument}` : ''}
          </span>
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyles[assignment.status]}`}
        >
          {statusLabels[assignment.status]}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {assignment.submission_file_url ? (
          <a
            href={assignment.submission_file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">description</span>
            Ver entrega
          </a>
        ) : (
          <span className="text-xs text-slate-400">Sin archivo entregado</span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <label className="text-[11px] text-slate-400">Nota:</label>
          <input
            type="number"
            min={0}
            max={20}
            value={grade}
            onChange={(e) => {
              setGrade(e.target.value);
              setSaved(false);
            }}
            placeholder="0-20"
            className="w-16 px-2 py-1 rounded-md border border-slate-200 text-xs"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saved}
            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold disabled:opacity-40"
          >
            {loading ? '...' : 'Guardar'}
          </button>
        </div>
      </div>
      {assignment.submission_note && (
        <p className="text-xs text-slate-500 italic">"{assignment.submission_note}"</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
