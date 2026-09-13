'use server';

import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateMemberRole(userId: string, role: 'director' | 'miembro') {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede cambiar roles.');

  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw new Error(error.message);

  revalidatePath('/equipo');
}

export async function toggleMemberActive(userId: string, active: boolean) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede hacer esto.');

  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ active }).eq('id', userId);
  if (error) throw new Error(error.message);

  revalidatePath('/equipo');
}

// Permite al director editar el instrumento y el cargo (rol dentro del
// equipo, ej. "Líder de alabanza") de cualquier miembro.
export async function updateMemberExtra(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede editar el equipo.');

  const userId = formData.get('user_id') as string;
  if (!userId) throw new Error('Falta el id del miembro.');

  const instrument = (formData.get('instrument') as string) || null;
  const cargo = (formData.get('cargo') as string) || null;

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ instrument, cargo })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  revalidatePath('/equipo');
  revalidatePath('/tareas');
  revalidatePath(`/tareas/miembro/${userId}`);
}
