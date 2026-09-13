// Paleta de colores disponible para las tarjetas de canciones.
// Cada color define su versión para modo claro y su versión para modo oscuro,
// manteniendo buen contraste de texto en ambos casos.
export const SONG_COLORS: Record<
  string,
  { label: string; card: string; swatch: string }
> = {
  slate: {
    label: 'Gris (por defecto)',
    card: 'bg-slate-50 border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700',
    swatch: 'bg-slate-300 dark:bg-slate-500',
  },
  rose: {
    label: 'Rosa',
    card: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60',
    swatch: 'bg-rose-300 dark:bg-rose-500',
  },
  amber: {
    label: 'Ámbar',
    card: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60',
    swatch: 'bg-amber-300 dark:bg-amber-500',
  },
  lime: {
    label: 'Verde lima',
    card: 'bg-lime-50 border-lime-200 dark:bg-lime-950/40 dark:border-lime-800/60',
    swatch: 'bg-lime-300 dark:bg-lime-500',
  },
  teal: {
    label: 'Verde azulado',
    card: 'bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800/60',
    swatch: 'bg-teal-300 dark:bg-teal-500',
  },
  sky: {
    label: 'Celeste',
    card: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800/60',
    swatch: 'bg-sky-300 dark:bg-sky-500',
  },
  violet: {
    label: 'Violeta',
    card: 'bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800/60',
    swatch: 'bg-violet-300 dark:bg-violet-500',
  },
  pink: {
    label: 'Fucsia suave',
    card: 'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-800/60',
    swatch: 'bg-pink-300 dark:bg-pink-500',
  },
};

export function songColorClasses(color: string | null | undefined) {
  return SONG_COLORS[color ?? 'slate']?.card ?? SONG_COLORS.slate.card;
}
