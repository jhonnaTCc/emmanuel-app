import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import TaskAssignmentCard from '@/components/TaskAssignmentCard';
import TaskCardDirector from '@/components/TaskCardDirector';
import MemberTaskSummary from '@/components/MemberTaskSummary';
import Link from 'next/link';

export default async function TareasPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  if (profile?.role === 'director') {
    const [{ data: tasks }, { data: members }, { data: categories }] = await Promise.all([
      supabase
        .from('tasks')
        .select('*, task_assignments(*, profiles(full_name, instrument))')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*, task_assignments(status)').order('full_name'),
      supabase.from('task_categories').select('id, name').order('name'),
    ]);

    const membersWithStats = (members ?? []).map((m: any) => {
      const total = m.task_assignments.length;
      const done = m.task_assignments.filter((a: any) => a.status === 'completada').length;
      return { ...m, stats: { total, done } };
    });

    return (
      <AppShell fullName={profile.full_name} role={profile.role}>
        <div className="flex flex-col gap-8">
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

          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Equipo (toca a alguien para ver todas sus tareas)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {membersWithStats.map((m: any) => (
                <MemberTaskSummary key={m.id} member={m} />
              ))}
              {membersWithStats.length === 0 && (
                <p className="text-slate-400 text-sm col-span-full">Aún no hay miembros registrados.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Tareas creadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(tasks ?? []).map((task: any) => (
                <TaskCardDirector key={task.id} task={task} categories={categories ?? []} />
              ))}
              {(!tasks || tasks.length === 0) && (
                <p className="text-slate-400 text-sm col-span-full">Aún no hay tareas creadas.</p>
              )}
            </div>
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
