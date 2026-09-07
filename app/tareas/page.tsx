import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import TaskAssignmentCard from '@/components/TaskAssignmentCard';
import Link from 'next/link';

export default async function TareasPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  if (profile?.role === 'director') {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, task_assignments(*, profiles(full_name, instrument))')
      .order('created_at', { ascending: false });

    return (
      <AppShell fullName={profile.full_name} role={profile.role}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
                Asignaciones & Ensayos del Equipo
              </p>
              <h1 className="text-2xl font-bold text-slate-900">Tareas Semanales</h1>
            </div>
            <Link
              href="/tareas/nueva"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nueva Tarea
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(tasks ?? []).map((task: any) => {
              const total = task.task_assignments.length;
              const done = task.task_assignments.filter(
                (a: any) => a.status === 'completada'
              ).length;
              return (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
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
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    {task.task_assignments.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">
                          {a.profiles?.full_name}{' '}
                          <span className="text-slate-400 text-xs">
                            {a.profiles?.instrument ? `· ${a.profiles.instrument}` : ''}
                          </span>
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            a.status === 'completada'
                              ? 'bg-emerald-50 text-emerald-700'
                              : a.status === 'en_progreso'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {a.status === 'completada'
                            ? 'Completada'
                            : a.status === 'en_progreso'
                            ? 'En progreso'
                            : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                    {total === 0 && (
                      <p className="text-xs text-slate-400">Sin integrantes asignados.</p>
                    )}
                  </div>
                </div>
              );
            })}
            {(!tasks || tasks.length === 0) && (
              <p className="text-slate-400 text-sm col-span-full">
                Aún no hay tareas creadas.
              </p>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // Vista de MIEMBRO: solo sus asignaciones
  const { data: assignments } = await supabase
    .from('task_assignments')
    .select('*, tasks(*)')
    .eq('user_id', profile?.id)
    .order('created_at', { ascending: false });

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            Mis tareas
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Tareas Semanales</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(assignments ?? []).map((a: any) => (
            <TaskAssignmentCard key={a.id} assignment={a} task={a.tasks} />
          ))}
          {(!assignments || assignments.length === 0) && (
            <p className="text-slate-400 text-sm col-span-full">
              No tienes tareas asignadas por ahora.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
