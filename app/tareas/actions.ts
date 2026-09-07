'use server';

import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede crear tareas.');

  const supabase = createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const due_date = formData.get('due_date') as string;
  const song_id = (formData.get('song_id') as string) || null;
  const assignedUserIds = formData.getAll('assigned_user_id') as string[];
  const file = formData.get('reference_file') as File | null;

  let reference_file_url: string | null = null;
  let reference_file_name: string | null = null;

  if (file && file.size > 0) {
    const path = `tareas/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('tareas').upload(path, file);
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicUrl } = supabase.storage.from('tareas').getPublicUrl(path);
    reference_file_url = publicUrl.publicUrl;
    reference_file_name = file.name;
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      category,
      due_date: due_date || null,
      song_id,
      reference_file_url,
      reference_file_name,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (assignedUserIds.length > 0) {
    const rows = assignedUserIds.map((user_id) => ({ task_id: task.id, user_id }));
    const { error: assignError } = await supabase.from('task_assignments').insert(rows);
    if (assignError) throw new Error(assignError.message);
  }

  revalidatePath('/tareas');
  revalidatePath('/dashboard');
  return task;
}

export async function updateAssignmentStatus(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('No autenticado.');

  const supabase = createClient();
  const assignmentId = formData.get('assignment_id') as string;
  const status = formData.get('status') as string;
  const submission_note = formData.get('submission_note') as string;
  const file = formData.get('submission_file') as File | null;

  let submission_file_url: string | undefined;

  if (file && file.size > 0) {
    const path = `entregas/${profile.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('tareas').upload(path, file);
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicUrl } = supabase.storage.from('tareas').getPublicUrl(path);
    submission_file_url = publicUrl.publicUrl;
  }

  const updates: Record<string, any> = {
    status,
    submission_note,
  };
  if (submission_file_url) updates.submission_file_url = submission_file_url;
  if (status === 'completada') updates.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from('task_assignments')
    .update(updates)
    .eq('id', assignmentId);

  if (error) throw new Error(error.message);

  revalidatePath('/tareas');
  revalidatePath('/equipo');
}
