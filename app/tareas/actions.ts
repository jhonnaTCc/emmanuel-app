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
  const color_tag = (formData.get('color_tag') as string) || 'slate';
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
      color_tag,
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

// Editar título/descripción/categoría/fecha/color de una tarea existente.
export async function updateTask(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede editar tareas.');

  const taskId = formData.get('task_id') as string;
  if (!taskId) throw new Error('Falta el id de la tarea.');

  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const category = (formData.get('category') as string) || null;
  const due_dateRaw = formData.get('due_date') as string;
  const due_date = due_dateRaw ? due_dateRaw : null;
  const color_tag = (formData.get('color_tag') as string) || 'slate';

  const supabase = createClient();
  const { error } = await supabase
    .from('tasks')
    .update({ title, description, category, due_date, color_tag })
    .eq('id', taskId);

  if (error) throw new Error(error.message);

  revalidatePath('/tareas');
  revalidatePath('/dashboard');
}

export async function deleteTask(taskId: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede borrar tareas.');

  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw new Error(error.message);

  revalidatePath('/tareas');
  revalidatePath('/dashboard');
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

// El director califica la entrega de un miembro con una nota de 0 a 20.
export async function gradeAssignment(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede calificar tareas.');

  const assignmentId = formData.get('assignment_id') as string;
  const gradeRaw = formData.get('grade') as string;

  if (!assignmentId) throw new Error('Falta el id de la asignación.');

  let grade: number | null = null;
  if (gradeRaw !== '' && gradeRaw !== null && gradeRaw !== undefined) {
    grade = Number(gradeRaw);
    if (Number.isNaN(grade) || grade < 0 || grade > 20) {
      throw new Error('La nota debe ser un número entre 0 y 20.');
    }
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('task_assignments')
    .update({ grade })
    .eq('id', assignmentId);

  if (error) throw new Error(error.message);

  revalidatePath('/tareas');
}

// Crea una categoría de tarea nueva (el director puede agregar las que quiera).
export async function createTaskCategory(name: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== 'director') throw new Error('Solo el director puede agregar categorías.');

  const clean = name.trim();
  if (!clean) throw new Error('El nombre de la categoría no puede estar vacío.');

  const supabase = createClient();
  const { data, error } = await supabase
    .from('task_categories')
    .insert({ name: clean, created_by: profile.id })
    .select()
    .single();

  // Si ya existe (choque de unicidad), no es un error real: la reutilizamos.
  if (error && !error.message.includes('duplicate')) throw new Error(error.message);

  revalidatePath('/tareas/nueva');
  revalidatePath('/tareas');
  return data ?? { name: clean };
}
