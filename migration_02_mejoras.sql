-- =========================================================
-- MIGRACIÓN 02: color en tareas, notas 0-20, categorías
-- personalizadas de tareas, y "cargo" extra para miembros.
-- Copia y pega TODO este archivo en:
-- Supabase Dashboard > SQL Editor > New query > Run
-- =========================================================

-- ---------- TAREAS: color de tarjeta ----------
alter table tasks add column if not exists color_tag text not null default 'slate';

-- ---------- ASIGNACIONES: nota de 0 a 20 ----------
alter table task_assignments add column if not exists grade int;
alter table task_assignments
  drop constraint if exists task_assignments_grade_check;
alter table task_assignments
  add constraint task_assignments_grade_check check (grade is null or (grade >= 0 and grade <= 20));

-- ---------- PERFILES: cargo/rol dentro del equipo ----------
alter table profiles add column if not exists cargo text; -- ej: "Líder de alabanza", "Encargado de audio"

-- ---------- CATEGORÍAS DE TAREAS (editables por el director) ----------
create table if not exists task_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

insert into task_categories (name) values
  ('Músicos & Ensayo'),
  ('Vocalistas & Armonías'),
  ('Audio & Multimedia'),
  ('Letras & Traducciones'),
  ('Producción & Logística'),
  ('Redes & Contenido')
on conflict (name) do nothing;

alter table task_categories enable row level security;

drop policy if exists "task_categories_select_all" on task_categories;
create policy "task_categories_select_all" on task_categories
  for select using (auth.uid() is not null);

drop policy if exists "task_categories_write_director" on task_categories;
create policy "task_categories_write_director" on task_categories
  for insert with check (public.is_director());

drop policy if exists "task_categories_delete_director" on task_categories;
create policy "task_categories_delete_director" on task_categories
  for delete using (public.is_director());

select 'Migración 02 aplicada correctamente.' as resultado;
