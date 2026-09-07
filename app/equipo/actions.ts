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
