'use client';

// components/LyricsChords.tsx
// Pinta la letra en formato ChordPro con acordes arriba de cada sílaba,
// etiquetas de sección (Coro/Verso/Puente) y controles de tonalidad en vivo.
// El modo oscuro/claro es global (ver lib/theme/ThemeProvider): este componente
// solo usa las variantes dark: de Tailwind, no maneja su propio estado de tema.

import { useEffect, useMemo, useRef, useState } from 'react';
import { parseChordPro } from '@/lib/chordpro';
import { renderTabLine, getKeyLabel } from '@/lib/transpose';

type LyricsChordsProps = {
  lyricsChordpro: string | null;
  originalKey: string | null; // viene de song.key_note
};

type TabChunk = { chordRow: string; lyricRow: string };

// Arma el texto plano (sin acordes) para copiar y pegar en el software de proyección,
// con cada sección separada por una línea en blanco y su etiqueta en mayúsculas.
function buildPlainText(sections: ReturnType<typeof parseChordPro>): string {
  return sections
    .map((section) => {
      const heading = section.label ? `${section.label.toUpperCase()}\n` : '';
      const lyricLines = section.lines
        .map((line) => line.map((seg) => seg.lyric).join(''))
        .join('\n');
      return `${heading}${lyricLines}`;
    })
    .join('\n\n');
}

// Corta un par (fila de acordes / fila de letra) en varios fragmentos que quepan
// en "maxChars" columnas, cortando siempre en un espacio de la LETRA (nunca a
// mitad de una palabra) para que el acorde nunca quede separado de su sílaba.
function wrapTabPair(chordRow: string, lyricRow: string, maxChars: number): TabChunk[] {
  const len = Math.max(chordRow.length, lyricRow.length);
  if (len <= maxChars || maxChars <= 0) {
    return [{ chordRow: chordRow.trimEnd(), lyricRow: lyricRow.trimEnd() }];
  }

  const c = chordRow.padEnd(len, ' ');
  const l = lyricRow.padEnd(len, ' ');

  const chunks: TabChunk[] = [];
  let start = 0;

  while (start < len) {
    let end = Math.min(start + maxChars, len);

    // Si el corte cae a mitad de una palabra, retrocede hasta el último
    // espacio disponible en ese tramo para no partirla.
    if (end < len) {
      let breakAt = end;
      while (breakAt > start && l[breakAt] !== ' ') {
        breakAt--;
      }
      if (breakAt > start) {
        end = breakAt;
      }
      // Si no hay ningún espacio en todo el tramo (palabra/acorde muy largo),
      // se corta igual en maxChars para no quedarnos pegados en un loop.
    }

    const chordChunk = c.slice(start, end).trimEnd();
    const lyricChunk = l.slice(start, end).trimEnd();
    if (chordChunk || lyricChunk) {
      chunks.push({ chordRow: chordChunk, lyricRow: lyricChunk });
    }

    // Salta espacios en blanco al inicio del siguiente fragmento.
    let next = end;
    while (next < len && l[next] === ' ' && c[next] === ' ') {
      next++;
    }
    start = next > start ? next : end + 1; // evita loops infinitos en casos raros
  }

  return chunks.length ? chunks : [{ chordRow: chordRow.trimEnd(), lyricRow: lyricRow.trimEnd() }];
}

// Calcula cuántas columnas de texto monoespaciado caben en el ancho disponible,
// midiendo un span oculto con la misma fuente/tamaño que el resto de la letra.
// Se recalcula solo (ResizeObserver) al cambiar el tamaño de pantalla, rotar el
// celular, o cambiar el tamaño de letra con los botones A-/A+.
function useMonoCharsPerLine(fontScale: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [maxChars, setMaxChars] = useState(40);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const SAMPLE_LEN = 20;

    function recompute() {
      if (!container || !measure) return;
      const containerWidth = container.clientWidth;
      const charWidth = measure.getBoundingClientRect().width / SAMPLE_LEN;
      if (charWidth > 0 && containerWidth > 0) {
        // -1 de margen de seguridad para no quedar justo al borde del card.
        const chars = Math.max(10, Math.floor(containerWidth / charWidth) - 1);
        setMaxChars(chars);
      }
    }

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [fontScale]);

  return { containerRef, measureRef, maxChars };
}

export default function LyricsChords({ lyricsChordpro, originalKey }: LyricsChordsProps) {
  const [semitones, setSemitones] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [showChords, setShowChords] = useState(true);
  const [copied, setCopied] = useState(false);

  const sections = useMemo(() => parseChordPro(lyricsChordpro ?? ''), [lyricsChordpro]);
  const plainText = useMemo(() => buildPlainText(sections), [sections]);
  const baseKey = originalKey || '—';
  const currentKey = originalKey ? getKeyLabel(originalKey, semitones) : '—';

  const { containerRef, measureRef, maxChars } = useMonoCharsPerLine(fontScale);

  if (!lyricsChordpro?.trim()) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
        Esta canción todavía no tiene letra con acordes cargada.
      </p>
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no rompemos la UI, simplemente no marcamos "copiado"
    }
  }

  return (
    <div>
      {/* Barra de controles: modo de vista, tonalidad y tamaño de letra */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
          <button
            type="button"
            onClick={() => setShowChords(true)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              showChords
                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Con acordes
          </button>
          <button
            type="button"
            onClick={() => setShowChords(false)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              !showChords
                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Solo letra
          </button>
        </div>

        {showChords ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tonalidad</span>
            <button
              type="button"
              onClick={() => setSemitones((s) => s - 1)}
              disabled={!originalKey}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              aria-label="Bajar un semitono"
            >
              −
            </button>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-400/10 border border-amber-100 dark:border-amber-400/30 text-amber-700 dark:text-amber-400 font-semibold text-sm min-w-[28px] text-center">
              {currentKey}
            </span>
            <button
              type="button"
              onClick={() => setSemitones((s) => s + 1)}
              disabled={!originalKey}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              aria-label="Subir un semitono"
            >
              +
            </button>
            {semitones !== 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">orig. {baseKey}</span>
            )}
            {semitones !== 0 && (
              <button
                type="button"
                onClick={() => setSemitones(0)}
                className="text-xs font-semibold text-blue-600 dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-300"
              >
                Restablecer
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-amber-400 hover:bg-blue-700 dark:hover:bg-amber-300 text-white dark:text-slate-950 text-xs font-bold"
          >
            {copied ? '¡Copiado!' : 'Copiar letra'}
          </button>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFontScale((f) => Math.max(0.8, +(f - 0.1).toFixed(1)))}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Reducir tamaño de letra"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontScale((f) => Math.min(1.6, +(f + 0.1).toFixed(1)))}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Aumentar tamaño de letra"
          >
            A+
          </button>
        </div>
      </div>

      {/* Secciones de la canción */}
      {/* min-w-0 evita que el contenido monoespaciado ancho fuerce el crecimiento
          de este contenedor en layouts flex/grid del padre. containerRef mide el
          ancho disponible real para calcular cuántas columnas caben por línea. */}
      <div
        ref={containerRef}
        style={{ fontSize: `${fontScale}rem` }}
        className="space-y-5 min-w-0"
      >
        {/* Span invisible usado solo para medir el ancho de un carácter en la
            fuente monoespaciada actual. No ocupa espacio visual ni afecta el layout. */}
        <span
          ref={measureRef}
          aria-hidden="true"
          className="font-mono whitespace-pre absolute opacity-0 pointer-events-none -z-10"
          style={{ left: '-9999px', top: 0 }}
        >
          00000000000000000000
        </span>

        {sections.map((section, sIdx) => {
          const isChorus = section.label?.startsWith('Coro') ?? false;
          return (
            <div key={sIdx} className="min-w-0">
              {section.label && (
                <>
                  {/* Modo claro: etiqueta tipo "pill". Modo oscuro: estilo tablatura "[Etiqueta]" */}
                  <span
                    className={`dark:hidden inline-block text-[11px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-0.5 mb-2 ${
                      isChorus
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {section.label}
                  </span>
                  <p className="hidden dark:block text-slate-300 font-bold mb-2">
                    [{section.label}]
                  </p>
                </>
              )}
              <div
                className={
                  isChorus && showChords
                    ? 'space-y-1 border-l-2 border-blue-200 dark:border-amber-400/30 pl-3 min-w-0'
                    : 'space-y-1 min-w-0'
                }
              >
                {section.lines.map((line, lIdx) => {
                  // Marcador de línea en blanco (separación visual dentro de la sección)
                  if (line.length === 0) {
                    return <div key={lIdx} className="h-3" />;
                  }

                  if (!showChords) {
                    // Modo "solo letra": une los segmentos en una sola línea de texto plano,
                    // ideal para leer o copiar hacia el software de proyección.
                    const plainLine = line.map((seg) => seg.lyric).join('');
                    return (
                      <p key={lIdx} className="leading-relaxed text-slate-800 dark:text-slate-100">
                        {plainLine || '\u00A0'}
                      </p>
                    );
                  }

                  // Modo "Con acordes": alineado por columnas como una tablatura de texto,
                  // usando espacios reales para que el acorde quede exacto sobre su sílaba.
                  // Si la línea completa no entra en pantalla, se corta en fragmentos que
                  // sí caben (siempre en un espacio entre palabras) y se apilan uno debajo
                  // del otro, en vez de desbordar el card o requerir scroll horizontal.
                  const { chordRow, lyricRow } = renderTabLine(line, semitones);
                  const chunks = wrapTabPair(chordRow, lyricRow, maxChars);
                  return (
                    <div key={lIdx} className="font-mono leading-tight">
                      {chunks.map((chunk, cIdx) => (
                        <div key={cIdx} className={cIdx > 0 ? 'mt-0.5' : undefined}>
                          {chunk.chordRow && (
                            <div className="whitespace-pre text-blue-600 dark:text-amber-400 font-bold">
                              {chunk.chordRow}
                            </div>
                          )}
                          {chunk.lyricRow && (
                            <div className="whitespace-pre text-slate-800 dark:text-slate-100">
                              {chunk.lyricRow}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
