// lib/transpose.ts
// Transpone acordes individuales o líneas completas de ChordPro N semitonos.
// No toca Supabase ni el texto guardado: opera en memoria sobre lo ya cargado.

import type { ChordProLine, LyricSegment } from './chordpro';

const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_INDEX: Record<string, number> = {};
SHARP_SCALE.forEach((note, i) => {
  NOTE_TO_INDEX[note] = i;
});
FLAT_SCALE.forEach((note, i) => {
  NOTE_TO_INDEX[note] = i;
});

// Captura la raíz (A-G, con # o b opcional) y deja el resto como sufijo:
// "F#m7" -> raíz "F#", sufijo "m7"
const CHORD_REGEX = /^([A-G](?:#|b)?)(.*)$/;

/**
 * Transpone un solo acorde N semitonos.
 * Si el acorde no se reconoce (ej. "N.C." o texto suelto), se devuelve sin cambios.
 */
export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  if (!chord || semitones === 0) return chord;

  const match = chord.match(CHORD_REGEX);
  if (!match) return chord;

  const [, root, suffix] = match;
  const index = NOTE_TO_INDEX[root];
  if (index === undefined) return chord;

  // El doble módulo evita índices negativos cuando semitones es negativo
  const newIndex = ((index + semitones) % 12 + 12) % 12;
  const scale = useFlats ? FLAT_SCALE : SHARP_SCALE;

  return scale[newIndex] + suffix;
}

/**
 * Transpone todos los acordes de una línea ya parseada (ver chordpro.ts),
 * dejando la letra intacta.
 */
export function transposeLine(
  segments: ChordProLine,
  semitones: number,
  useFlats = false
): ChordProLine {
  return segments.map((seg: LyricSegment) => ({
    ...seg,
    chord: seg.chord ? transposeChord(seg.chord, semitones, useFlats) : null,
  }));
}

/**
 * Calcula la etiqueta de tonalidad a mostrar en la barra de controles,
 * ej. getKeyLabel('G', 2) -> 'A'
 */
export function getKeyLabel(originalKey: string, semitones: number, useFlats = false): string {
  return transposeChord(originalKey, semitones, useFlats);
}
