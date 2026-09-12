// lib/chordpro.ts
// Convierte texto en formato ChordPro en una estructura de secciones
// listas para renderizar, con etiquetas de tipo (Verso, Coro, Puente, etc).

export type LyricSegment = {
  chord: string | null;
  lyric: string;
};

export type ChordProLine = LyricSegment[];

export type ChordProSection = {
  label: string | null; // null = sin etiqueta (letra suelta sin {directiva})
  lines: ChordProLine[];
};

// Mapea abreviaturas y variantes en inglés/español a una etiqueta consistente.
// El director puede escribir {coro}, {chorus} o {soc} y el resultado es el mismo.
const SECTION_LABELS: Record<string, string> = {
  coro: 'Coro',
  chorus: 'Coro',
  soc: 'Coro',

  verso: 'Verso',
  verse: 'Verso',
  sov: 'Verso',

  puente: 'Puente',
  bridge: 'Puente',
  sob: 'Puente',

  precoro: 'Pre-coro',
  prechorus: 'Pre-coro',

  intro: 'Intro',
  final: 'Final',
  outro: 'Final',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function resolveSectionLabel(tag: string, extra?: string): string {
  const base = SECTION_LABELS[tag.toLowerCase()] ?? capitalize(tag);
  return extra ? `${base} ${extra}`.trim() : base;
}

// Convierte "[G]Cuán grande [D]es Él" en:
// [{chord:'G', lyric:'Cuán grande '}, {chord:'D', lyric:'es Él'}]
function parseLyricLine(line: string): ChordProLine {
  const tokens = line.split(/(\[[^\]]+\])/g).filter((t) => t !== '');
  const segments: ChordProLine = [];
  let pendingChord: string | null = null;

  for (const token of tokens) {
    const chordMatch = token.match(/^\[([^\]]+)\]$/);
    if (chordMatch) {
      pendingChord = chordMatch[1];
    } else {
      segments.push({ chord: pendingChord, lyric: token });
      pendingChord = null;
    }
  }

  // Caso raro: un acorde al final de la línea sin letra después (ej. "...amén [G]")
  if (pendingChord) {
    segments.push({ chord: pendingChord, lyric: '' });
  }

  return segments;
}

// Punto de entrada: recibe el texto completo guardado en lyrics_chordpro
// y devuelve un array de secciones, cada una con su etiqueta y sus líneas.
export function parseChordPro(text: string): ChordProSection[] {
  const rawLines = text.split('\n');
  const sections: ChordProSection[] = [];
  let current: ChordProSection = { label: null, lines: [] };

  const flushCurrent = () => {
    if (current.lines.length > 0) {
      sections.push(current);
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    // Directiva de sección: {coro}, {verso: 1}, {puente}...
    const directiveMatch = line.match(/^\{(\w+)(?::\s*(.+))?\}$/);
    if (directiveMatch) {
      flushCurrent();
      const [, tag, extra] = directiveMatch;
      current = { label: resolveSectionLabel(tag, extra), lines: [] };
      continue;
    }

    // Línea vacía: separa párrafos cuando no se usan directivas explícitas
    if (line === '') {
      if (current.lines.length > 0) {
        flushCurrent();
        current = { label: null, lines: [] };
      }
      continue;
    }

    current.lines.push(parseLyricLine(line));
  }

  flushCurrent();
  return sections;
}
