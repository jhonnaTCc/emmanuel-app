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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
          {member.full_name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">
            {member.full_name} {isSelf && <span className="text-xs text-slate-400">(tú)</span>}
          </p>
          <MemberProfileEditable member={member} isDirector={isDirector} />
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-1 rounded-full capitalize ${
            member.role === 'director'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {member.role}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Tareas completadas</span>
          <span>
            {done}/{total}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {isDirector && !isSelf && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <select
            defaultValue={member.role}
            disabled={loading}
            onChange={async (e) => {
              setLoading(true);
              await updateMemberRole(member.id, e.target.value as any);
              setLoading(false);
            }}
            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
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
            className="text-xs font-semibold text-slate-500 hover:text-red-600"
          >
            {member.active ? 'Desactivar' : 'Reactivar'}
          </button>
        </div>
      )}
    </div>
  );
}
