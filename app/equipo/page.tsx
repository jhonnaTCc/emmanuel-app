import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import MemberCard from '@/components/MemberCard';

export default async function EquipoPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const { data: members } = await supabase
    .from('profiles')
    .select('*, task_assignments(status)')
    .order('full_name');

  const withStats = (members ?? []).map((m: any) => {
    const total = m.task_assignments.length;
    const done = m.task_assignments.filter((a: any) => a.status === 'completada').length;
    return { ...m, stats: { total, done } };
  });

  return (
    <AppShell fullName={profile?.full_name ?? ''} role={profile?.role ?? ''}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            Ministerio de Alabanza
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Equipo</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {withStats.map((m: any) => (
            <MemberCard
              key={m.id}
              member={m}
              isDirector={profile?.role === 'director'}
              isSelf={m.id === profile?.id}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
