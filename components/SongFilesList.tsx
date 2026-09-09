'use client';

import { useState } from 'react';

const typeLabels: Record<string, string> = {
  partitura: 'Partitura',
  cifrado: 'Cifrado',
  audio: 'Audio',
  otro: 'Otro',
};

const typeIcons: Record<string, string> = {
  partitura: 'description',
  cifrado: 'music_note',
  audio: 'graphic_eq',
  otro: 'attach_file',
};

function isPdf(file: any) {
  return (
    file.file_url?.toLowerCase().endsWith('.pdf') ||
    file.file_name?.toLowerCase().endsWith('.pdf')
  );
}

function isAudio(file: any) {
  return file.file_type === 'audio';
}

export default function SongFilesList({ files }: { files: any[] }) {
  const [openId, setOpenId] = useState<string | null>(
    files.find((f) => isPdf(f))?.id ?? null
  );

  if (!files || files.length === 0) {
    return <p className="text-sm text-slate-400">Sin archivos adjuntos todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {files.map((f) => {
        const open = openId === f.id;
        return (
          <div key={f.id} className="rounded-lg border border-slate-100 overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : f.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-all text-left"
            >
              <span className="material-symbols-outlined text-blue-600">
                {typeIcons[f.file_type] ?? 'description'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{f.file_name}</p>
                <p className="text-xs text-slate-400">{typeLabels[f.file_type]}</p>
              </div>
              {(isPdf(f) || isAudio(f)) && (
                <span className="material-symbols-outlined text-slate-400">
                  {open ? 'expand_less' : 'visibility'}
                </span>
              )}
              <a
                href={f.file_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Descargar"
                className="text-slate-300 hover:text-blue-600"
              >
                <span className="material-symbols-outlined">download</span>
              </a>
            </button>

            {open && isPdf(f) && (
              <div className="border-t border-slate-100 bg-slate-50">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    f.file_url
                  )}&embedded=true`}
                  className="w-full h-[70vh] md:h-[80vh]"
                  title={f.file_name}
                />
                <div className="p-2 text-center border-t border-slate-100">
                  <a
                    href={f.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600"
                  >
                    ¿No se ve bien? Ábrelo en una pestaña nueva →
                  </a>
                </div>
              </div>
            )}

            {open && isAudio(f) && (
              <div className="border-t border-slate-100 bg-slate-50 p-4">
                <audio controls src={f.file_url} className="w-full">
                  Tu navegador no soporta audio.
                </audio>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
