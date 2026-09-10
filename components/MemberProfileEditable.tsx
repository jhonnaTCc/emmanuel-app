'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateMemberExtra } from '@/app/equipo/actions';

export default function MemberProfileEditable({
  member,
  isDirector,
}: {
  member: any;
  isDirector: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set('user_id', member.id);
    try {
      await updateMemberExtra(formData);
      setEditing(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isDirector) {
    return (
      <p className="text-sm text-slate-500">
        {member.instrument || 'Sin instrumento'}
        {member.cargo ? ` · ${member.cargo}` : ''}
      </p>
    );
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm text-slate-500">
          {member.instrument || 'Sin instrumento'}
          {member.cargo ? ` · ${member.cargo}` : ' · Sin cargo asignado'}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <input
        name="instrument"
        defaultValue={member.instrument ?? ''}
        placeholder="Instrumento (ej. Guitarra)"
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
      />
      <input
        name="cargo"
        defaultValue={member.cargo ?? ''}
        placeholder="Cargo (ej. Líder de alabanza)"
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
