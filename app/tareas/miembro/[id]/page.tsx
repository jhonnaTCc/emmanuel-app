import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import MemberProfileEditable from '@/components/MemberProfileEditable';
import AssignmentGrader from '@/components/AssignmentGrader';
import Link from 'next/link';

export default async function MiembroTareasPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const isDirector = profile?.role === 'director';
  const isSelf = profile?.id === params.id;

  if (!isDirector && !isSelf) {
    return (
      <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
        <p className="text-slate-500">No tienes permiso para ver esta página.</p>
      </AppShell>
    );
  }

  const [{ data: member }, { data: assignments }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase
      .from('task_assignments')
      .select('*, tasks(*), profiles(full_name, instrument)')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false }),
  ]);

  if (!member) {
    return (
      <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
        <p className="text-slate-500">Miembro no encontrado.</p>
      </AppShell>
    );
  }

  const pending = (assignments ?? []).filter((a: any) => a.status !== 'completada');
  const done = (assignments ?? []).filter((a: any) => a.status === 'completada');

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-6">
        <Link href="/tareas" className="text-xs font-semibold text-blue-600 hover:text-blue-700 w-fit">
          ← Volver a Tareas Semanales
        </Link>

        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
            {member.full_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{member.full_name}</h1>
            <MemberProfileEditable member={member} isDirector={isDirector} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold text-slate-900 mb-3">
              Pendientes <span className="text-slate-400 font-normal">({pending.length})</span>
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((a: any) => (
                <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-slate-900 text-sm">{a.tasks?.title}</p>
                  {a.tasks?.category && (
                    <p className="text-xs text-blue-600 font-bold uppercase mt-0.5">
                      {a.tasks.category}
                    </p>
                  )}
                  {isDirector ? (
                    <div className="mt-2">
                      <AssignmentGrader assignment={a} />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">Estado: {a.status}</p>
                  )}
                </div>
              ))}
              {pending.length === 0 && (
                <p className="text-sm text-slate-400">Sin tareas pendientes. 🎉</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 mb-3">
              Completadas <span className="text-slate-400 font-normal">({done.length})</span>
            </h2>
            <div className="flex flex-col gap-3">
              {done.map((a: any) => (
                <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-slate-900 text-sm">{a.tasks?.title}</p>
                  {a.tasks?.category && (
                    <p className="text-xs text-blue-600 font-bold uppercase mt-0.5">
                      {a.tasks.category}
                    </p>
                  )}
                  {isDirector ? (
                    <div className="mt-2">
                      <AssignmentGrader assignment={a} />
                    </div>
                  ) : (
                    a.grade !== null &&
                    a.grade !== undefined && (
                      <p className="text-xs text-emerald-700 font-bold mt-1">Nota: {a.grade}/20</p>
                    )
                  )}
                </div>
              ))}
              {done.length === 0 && (
                <p className="text-sm text-slate-400">Todavía no hay tareas completadas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
