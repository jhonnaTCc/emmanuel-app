import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import NewTaskForm from '@/components/NewTaskForm';

export default async function NuevaTareaPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  if (profile?.role !== 'director') {
    return (
      <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
        <p className="text-slate-500">Solo el director puede crear tareas.</p>
      </AppShell>
    );
  }

  const [{ data: members }, { data: songs }, { data: categories }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, instrument')
      .eq('active', true)
      .order('full_name'),
    supabase.from('songs').select('id, title').order('title'),
    supabase.from('task_categories').select('id, name').order('name'),
  ]);

  return (
    <AppShell fullName={profile.full_name} role={profile.role}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            Nueva asignación
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Crear Tarea Semanal</h1>
        </div>
        <NewTaskForm members={members ?? []} songs={songs ?? []} categories={categories ?? []} />
      </div>
    </AppShell>
  );
}
