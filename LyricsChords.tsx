'use client';

// components/LyricsChords.tsx
// Pinta la letra en formato ChordPro con acordes arriba de cada sílaba,
// etiquetas de sección (Coro/Verso/Puente) y controles de tonalidad en vivo.
// El modo oscuro/claro es global (ver lib/theme/ThemeProvider): este componente
// solo usa las variantes dark: de Tailwind, no maneja su propio estado de tema.

import { useMemo, useState } from 'react';
import { parseChordPro } from '@/lib/chordpro';
import { transposeLine, getKeyLabel } from '@/lib/transpose';

type LyricsChordsProps = {
  lyricsChordpro: string | null;
  originalKey: string | null; // viene de song.key_note
};

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

export default function LyricsChords({ lyricsChordpro, originalKey }: LyricsChordsProps) {
  const [semitones, setSemitones] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [showChords, setShowChords] = useState(true);
  const [copied, setCopied] = useState(false);

  const sections = useMemo(() => parseChordPro(lyricsChordpro ?? ''), [lyricsChordpro]);
  const plainText = useMemo(() => buildPlainText(sections), [sections]);
  const baseKey = originalKey || '—';
  const currentKey = originalKey ? getKeyLabel(originalKey, semitones) : '—';

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
      <div
        style={{ fontSize: `${fontScale}rem` }}
        className="space-y-5 dark:font-mono"
      >
        {sections.map((section, sIdx) => {
          const isChorus = section.label?.startsWith('Coro') ?? false;
          return (
            <div key={sIdx}>
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
                    ? 'space-y-3 border-l-2 border-blue-200 dark:border-amber-400/30 pl-3'
                    : 'space-y-3'
                }
              >
                {section.lines.map((line, lIdx) => {
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

                  const transposed = transposeLine(line, semitones);
                  return (
                    <p key={lIdx} className="leading-loose text-slate-800 dark:text-slate-100">
                      {transposed.map((seg, segIdx) => (
                        <span key={segIdx} className="inline-block align-bottom">
                          {seg.chord && (
                            <span className="block text-blue-600 dark:text-amber-400 font-bold text-[0.8em] leading-none mb-0.5">
                              {seg.chord}
                            </span>
                          )}
                          <span className="block whitespace-pre">{seg.lyric || '\u00A0'}</span>
                        </span>
                      ))}
                    </p>
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
