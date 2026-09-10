// Paleta de colores pastel disponible para las tarjetas de canciones.
export const SONG_COLORS: Record<string, { label: string; card: string; swatch: string }> = {
  slate: { label: 'Gris (por defecto)', card: 'bg-slate-50 border-slate-200/80', swatch: 'bg-slate-300' },
  rose: { label: 'Rosa', card: 'bg-rose-50 border-rose-200', swatch: 'bg-rose-300' },
  amber: { label: 'Ámbar', card: 'bg-amber-50 border-amber-200', swatch: 'bg-amber-300' },
  lime: { label: 'Verde lima', card: 'bg-lime-50 border-lime-200', swatch: 'bg-lime-300' },
  teal: { label: 'Verde azulado', card: 'bg-teal-50 border-teal-200', swatch: 'bg-teal-300' },
  sky: { label: 'Celeste', card: 'bg-sky-50 border-sky-200', swatch: 'bg-sky-300' },
  violet: { label: 'Violeta', card: 'bg-violet-50 border-violet-200', swatch: 'bg-violet-300' },
  pink: { label: 'Fucsia suave', card: 'bg-pink-50 border-pink-200', swatch: 'bg-pink-300' },
};

export function songColorClasses(color: string | null | undefined) {
  return SONG_COLORS[color ?? 'slate']?.card ?? SONG_COLORS.slate.card;
}
