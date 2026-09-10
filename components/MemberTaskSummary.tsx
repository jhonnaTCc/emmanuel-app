import Link from 'next/link';

export default function MemberTaskSummary({ member }: { member: any }) {
  const total = member.stats.total;
  const done = member.stats.done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={`/tareas/miembro/${member.id}`}
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
        {member.full_name?.[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900 text-sm truncate">{member.full_name}</p>
        <p className="text-xs text-slate-500 truncate">
          {member.instrument || 'Sin instrumento'}
          {member.cargo ? ` · ${member.cargo}` : ''}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-bold text-slate-700">
          {done}/{total}
        </p>
        <p className="text-[10px] text-slate-400">{pct}%</p>
      </div>
    </Link>
  );
}
