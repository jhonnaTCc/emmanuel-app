'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Correo o contraseña incorrectos.');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            instrument,
            role: 'miembro', // los nuevos registros siempre entran como miembro
          },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setInfo('Cuenta creada. Ya puedes iniciar sesión.');
      setMode('login');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-3">
            E
          </div>
          <h1 className="text-xl font-bold text-slate-900">Emmanuel</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mt-1">
            Ministerio de Alabanza
          </p>
        </div>

        <div className="flex mb-6 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === 'signup' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Registrarme
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <>
              <input
                type="text"
                placeholder="Nombre completo"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Instrumento / rol (ej. Guitarra, Voz, Audio)"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        {mode === 'signup' && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            Tu cuenta entrará como "miembro". El director puede ascenderte a director desde
            "Equipo" si corresponde.
          </p>
        )}
      </div>
    </div>
  );
}
