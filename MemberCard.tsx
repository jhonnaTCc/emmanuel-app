'use client';

import { useState } from 'react';
import { updateMemberRole, toggleMemberActive } from '@/app/equipo/actions';
import MemberProfileEditable from './MemberProfileEditable';

export default function MemberCard({
  member,
  isDirector,
  isSelf,
}: {
  member: any;
  isDirector: boolean;
  isSelf: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const total = member.stats.total;
  const done = member.stats.done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
          {member.full_name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
            {member.full_name} {isSelf && <span className="text-xs text-slate-400 dark:text-slate-500">(tú)</span>}
          </p>
          <MemberProfileEditable member={member} isDirector={isDirector} />
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-1 rounded-full capitalize ${
            member.role === 'director'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {member.role}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Tareas completadas</span>
          <span>
            {done}/{total}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {isDirector && !isSelf && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <select
            defaultValue={member.role}
            disabled={loading}
            onChange={async (e) => {
              setLoading(true);
              await updateMemberRole(member.id, e.target.value as any);
              setLoading(false);
            }}
            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            <option value="miembro">Miembro</option>
            <option value="director">Director</option>
          </select>
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await toggleMemberActive(member.id, !member.active);
              setLoading(false);
            }}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600"
          >
            {member.active ? 'Desactivar' : 'Reactivar'}
          </button>
        </div>
      )}
    </div>
  );
}
