'use server';

import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveSetlist(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede editar el repertorio.');

  const supabase = createClient();

  const service_date = formData.get('service_date') as string;
  const service_time = formData.get('service_time') as string;
  const location = formData.get('location') as string;
  const title = formData.get('title') as string;

  // upsert del setlist por fecha
  const { data: setlist, error } = await supabase
    .from('setlists')
    .upsert(
      { service_date, service_time, location, title, director_id: profile.id },
      { onConflict: 'service_date' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Canciones seleccionadas: song_id::position::section_label separadas por "|"
  const selected = formData.getAll('song_entry') as string[];

  await supabase.from('setlist_songs').delete().eq('setlist_id', setlist.id);

  if (selected.length > 0) {
    const rows = selected.map((entry) => {
      const [song_id, position, section_label] = entry.split('::');
      return {
        setlist_id: setlist.id,
        song_id,
        position: Number(position),
        section_label: section_label || null,
      };
    });
    const { error: insertError } = await supabase.from('setlist_songs').insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath('/setlist');
  revalidatePath('/dashboard');
  return setlist;
}
