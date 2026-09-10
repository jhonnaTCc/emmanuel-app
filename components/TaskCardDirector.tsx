'use client';

import { songColorClasses } from '@/lib/songColors';
import EditTaskExtras from './EditTaskExtras';
import AssignmentGrader from './AssignmentGrader';

export default function TaskCardDirector({
  task,
  categories,
}: {
  task: any;
  categories: { id: string; name: string }[];
}) {
  const total = task.task_assignments.length;
  const done = task.task_assignments.filter((a: any) => a.status === 'completada').length;

  return (
    <div className={`border rounded-xl p-5 shadow-sm ${songColorClasses(task.color_tag)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {task.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {task.category}
            </span>
          )}
          <h3 className="font-bold text-slate-900 mt-1">{task.title}</h3>
          {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
          {task.due_date && (
            <p className="text-xs text-slate-400 mt-1">
              Vence: {new Date(task.due_date).toLocaleString('es-ES')}
            </p>
          )}
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/70 text-slate-600 flex-shrink-0">
          {done}/{total}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200/60">
        <EditTaskExtras task={task} categories={categories} />
      </div>

      <div className="flex flex-col mt-3 pt-3 border-t border-slate-200/60">
        {task.task_assignments.map((a: any) => (
          <AssignmentGrader key={a.id} assignment={a} />
        ))}
        {total === 0 && <p className="text-xs text-slate-400">Sin integrantes asignados.</p>}
      </div>
    </div>
  );
}
