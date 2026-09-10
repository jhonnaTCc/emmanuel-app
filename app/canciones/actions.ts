'use server';

import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSong(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede agregar canciones.');

  const supabase = createClient();

  const title = formData.get('title') as string;
  const artist_or_album = formData.get('artist_or_album') as string;
  const key_note = formData.get('key_note') as string;
  const bpm = formData.get('bpm') ? Number(formData.get('bpm')) : null;
  const time_signature = formData.get('time_signature') as string;
  const category = formData.get('category') as string;
  const youtube_url = (formData.get('youtube_url') as string) || null;
  const color_tag = (formData.get('color_tag') as string) || 'slate';

  const { data: song, error } = await supabase
    .from('songs')
    .insert({
      title,
      artist_or_album,
      key_note,
      bpm,
      time_signature,
      category,
      youtube_url,
      color_tag,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Archivo opcional al crear (partitura/cifrado/audio)
  const file = formData.get('file') as File | null;
  const fileType = (formData.get('file_type') as string) || 'partitura';

  if (file && file.size > 0) {
    await uploadFileForSong(song.id, file, fileType as any);
  }

  revalidatePath('/canciones');
  revalidatePath('/dashboard');
  return song;
}

export async function updateSongExtras(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede editar canciones.');

  const songId = formData.get('song_id') as string;
  if (!songId) throw new Error('Falta el id de la canción.');

  const supabase = createClient();

  const title = formData.get('title') as string;
  const artist_or_album = (formData.get('artist_or_album') as string) || null;
  const key_note = (formData.get('key_note') as string) || null;
  const bpmRaw = formData.get('bpm') as string;
  const bpm = bpmRaw ? Number(bpmRaw) : null;
  const time_signature = (formData.get('time_signature') as string) || null;
  const category = (formData.get('category') as string) || null;
  const youtube_url = (formData.get('youtube_url') as string) || null;
  const color_tag = (formData.get('color_tag') as string) || 'slate';

  const { error } = await supabase
    .from('songs')
    .update({
      title,
      artist_or_album,
      key_note,
      bpm,
      time_signature,
      category,
      youtube_url,
      color_tag,
    })
    .eq('id', songId);

  if (error) throw new Error(error.message);

  revalidatePath(`/canciones/${songId}`);
  revalidatePath('/canciones');
  revalidatePath('/dashboard');
}

export async function uploadFileForSong(
  songId: string,
  file: File,
  fileType: 'partitura' | 'cifrado' | 'audio' | 'otro'
) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede subir archivos.');

  const supabase = createClient();
  const path = `${songId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('partituras')
    .upload(path, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from('partituras').getPublicUrl(path);

  const { error } = await supabase.from('song_files').insert({
    song_id: songId,
    file_type: fileType,
    file_url: publicUrl.publicUrl,
    file_name: file.name,
    uploaded_by: profile.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/canciones/${songId}`);
}

export async function uploadFileForSongAction(formData: FormData) {
  const songId = formData.get('song_id') as string;
  const fileType = formData.get('file_type') as any;
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return;
  await uploadFileForSong(songId, file, fileType);
}

export async function deleteSong(songId: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede borrar canciones.');

  const supabase = createClient();
  const { error } = await supabase.from('songs').delete().eq('id', songId);
  if (error) throw new Error(error.message);

  revalidatePath('/canciones');
  revalidatePath('/dashboard');
}
