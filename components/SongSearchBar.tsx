'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

const CATEGORIES = ['Apertura', 'Alabanza', 'Íntimo', 'Ministración', 'Salida'];

export default function SongSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();

  function updateParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = {
      q: next.q ?? searchParams.get('q') ?? '',
      category: next.category ?? searchParams.get('category') ?? '',
    };
    if (merged.q) params.set('q', merged.q);
    else params.delete('q');
    if (merged.category) params.set('category', merged.category);
    else params.delete('category');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            updateParams({ q: e.target.value });
          }}
          placeholder="Buscar por título o artista..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
        />
      </div>
      <select
        defaultValue={searchParams.get('category') ?? ''}
        onChange={(e) => updateParams({ category: e.target.value })}
        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:w-56"
      >
        <option value="">Todas las categorías</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-slate-400">Buscando...</span>}
    </div>
  );
}
