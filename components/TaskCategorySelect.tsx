'use client';

import { useState } from 'react';
import { createTaskCategory } from '@/app/tareas/actions';

export default function TaskCategorySelect({
  categories,
  defaultValue = '',
  name = 'category',
}: {
  categories: { id: string; name: string }[];
  defaultValue?: string;
  name?: string;
}) {
  const [options, setOptions] = useState(categories.map((c) => c.name));
  const [value, setValue] = useState(defaultValue);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddCategory() {
    const clean = newCategory.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    try {
      await createTaskCategory(clean);
      setOptions((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      setValue(clean);
      setNewCategory('');
      setAdding(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        name={adding ? undefined : name}
        value={value}
        onChange={(e) => {
          if (e.target.value === '__nueva__') {
            setAdding(true);
          } else {
            setValue(e.target.value);
          }
        }}
        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm"
      >
        <option value="">Categoría</option>
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value="__nueva__">+ Agregar categoría nueva...</option>
      </select>

      {adding && (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nombre de la nueva categoría"
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleAddCategory}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-60"
          >
            {loading ? '...' : 'Agregar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewCategory('');
            }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Input oculto para que el valor viaje en el FormData cuando estamos agregando */}
      {adding && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
