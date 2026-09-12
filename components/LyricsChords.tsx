'use client';

// components/LyricsChords.tsx
// Pinta la letra en formato ChordPro con acordes arriba de cada sílaba,
// etiquetas de sección (Coro/Verso/Puente) y controles de tonalidad en vivo.
// Se usa dentro de una tarjeta existente en app/canciones/[id]/page.tsx.

import { useMemo, useState } from 'react';
import { parseChordPro } from '@/lib/chordpro';
import { transposeLine, getKeyLabel } from '@/lib/transpose';

type LyricsChordsProps = {
  lyricsChordpro: string | null;
  originalKey: string | null; // viene de song.key_note
};

export default function LyricsChords({ lyricsChordpro, originalKey }: LyricsChordsProps) {
  const [semitones, setSemitones] = useState(0);
  const [fontScale, setFontScale] = useState(1);

  const sections = useMemo(() => parseChordPro(lyricsChordpro ?? ''), [lyricsChordpro]);
  const baseKey = originalKey || '—';
  const currentKey = originalKey ? getKeyLabel(originalKey, semitones) : '—';

  if (!lyricsChordpro?.trim()) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        Esta canción todavía no tiene letra con acordes cargada.
      </p>
    );
  }

  return (
    <div>
      {/* Barra de controles: tonalidad + tamaño de letra */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Tonalidad</span>
          <button
            type="button"
            onClick={() => setSemitones((s) => s - 1)}
            disabled={!originalKey}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-sm hover:bg-slate-50 disabled:opacity-40"
            aria-label="Bajar un semitono"
          >
            −
          </button>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 font-semibold text-sm min-w-[28px] text-center">
            {currentKey}
          </span>
          <button
            type="button"
            onClick={() => setSemitones((s) => s + 1)}
            disabled={!originalKey}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-sm hover:bg-slate-50 disabled:opacity-40"
            aria-label="Subir un semitono"
          >
            +
          </button>
          {semitones !== 0 && (
            <span className="text-xs text-slate-400">orig. {baseKey}</span>
          )}
          {semitones !== 0 && (
            <button
              type="button"
              onClick={() => setSemitones(0)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Restablecer
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFontScale((f) => Math.max(0.8, +(f - 0.1).toFixed(1)))}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-xs font-semibold hover:bg-slate-50"
            aria-label="Reducir tamaño de letra"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontScale((f) => Math.min(1.6, +(f + 0.1).toFixed(1)))}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-xs font-semibold hover:bg-slate-50"
            aria-label="Aumentar tamaño de letra"
          >
            A+
          </button>
        </div>
      </div>

      {/* Secciones de la canción */}
      <div style={{ fontSize: `${fontScale}rem` }} className="space-y-5">
        {sections.map((section, sIdx) => {
          const isChorus = section.label?.startsWith('Coro') ?? false;
          return (
            <div key={sIdx}>
              {section.label && (
                <span
                  className={
                    isChorus
                      ? 'inline-block text-[11px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-0.5 mb-2 text-blue-700 bg-blue-50'
                      : 'inline-block text-[11px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-0.5 mb-2 text-slate-500 bg-slate-100'
                  }
                >
                  {section.label}
                </span>
              )}
              <div className={isChorus ? 'space-y-3 border-l-2 border-blue-200 pl-3' : 'space-y-3'}>
                {section.lines.map((line, lIdx) => {
                  const transposed = transposeLine(line, semitones);
                  return (
                    <p key={lIdx} className="leading-loose text-slate-800">
                      {transposed.map((seg, segIdx) => (
                        <span key={segIdx} className="inline-block align-bottom">
                          {seg.chord && (
                            <span className="block text-blue-600 font-bold text-[0.8em] leading-none mb-0.5">
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
