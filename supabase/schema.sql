-- =========================================================
-- ESQUEMA DE BASE DE DATOS - APP MINISTERIO DE ALABANZA
-- Copia y pega TODO este archivo en:
-- Supabase Dashboard > SQL Editor > New query > Run
-- =========================================================

-- ---------- PERFILES (extiende auth.users) ----------
create type user_role as enum ('director', 'miembro');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'miembro',
  instrument text, -- ej: "Guitarra", "Voz", "Batería", "Teclado", "Audio"
  phone text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Crea el perfil automáticamente cuando alguien se registra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, instrument)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'miembro'),
    new.raw_user_meta_data->>'instrument'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CANCIONES ----------
create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_or_album text,
  key_note text,        -- Tono, ej "G", "D"
  bpm int,
  time_signature text,  -- ej "4/4", "6/8"
  category text,        -- ej "Apertura", "Alabanza", "Íntimo", "Ministración", "Salida"
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Archivos asociados a una canción (partitura, cifrado, audio, etc.)
create type song_file_type as enum ('partitura', 'cifrado', 'audio', 'otro');

create table song_files (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references songs(id) on delete cascade,
  file_type song_file_type not null,
  file_url text not null,   -- ruta dentro del bucket de storage
  file_name text not null,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- SETLISTS (repertorio de cada domingo) ----------
create table setlists (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  service_time text default '10:00 AM',
  location text default 'Auditorio Principal',
  title text default 'Repertorio Oficial del Servicio',
  director_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (service_date)
);

create table setlist_songs (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references setlists(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  position int not null,
  section_label text -- ej "APERTURA", "CLÍMAX ADORACIÓN", "SALIDA"
);

-- ---------- TAREAS SEMANALES ----------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text, -- ej "Músicos & Ensayo", "Vocalistas & Armonías", "Audio & Multimedia"
  due_date timestamptz,
  song_id uuid references songs(id),
  reference_file_url text,
  reference_file_name text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Asignación de una tarea a una persona + su estado
create type task_status as enum ('pendiente', 'en_progreso', 'completada');

create table task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status task_status not null default 'pendiente',
  submission_file_url text,
  submission_note text,
  completed_at timestamptz,
  unique (task_id, user_id)
);

-- =========================================================
-- STORAGE BUCKETS (archivos: PDFs, audios)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('partituras', 'partituras', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('tareas', 'tareas', true)
on conflict (id) do nothing;

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================
alter table profiles enable row level security;
alter table songs enable row level security;
alter table song_files enable row level security;
alter table setlists enable row level security;
alter table setlist_songs enable row level security;
alter table tasks enable row level security;
alter table task_assignments enable row level security;

-- función auxiliar: ¿el usuario actual es director?
create function public.is_director()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'director'
  );
$$ language sql security definer stable;

-- PROFILES: todos los usuarios logueados pueden ver el equipo;
-- solo el director puede editar roles de otros; cada uno edita lo suyo.
create policy "profiles_select_all" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_update_director" on profiles for update using (public.is_director());

-- SONGS: todos ven; solo director sube/edita/borra.
create policy "songs_select_all" on songs for select using (auth.uid() is not null);
create policy "songs_write_director" on songs for insert with check (public.is_director());
create policy "songs_update_director" on songs for update using (public.is_director());
create policy "songs_delete_director" on songs for delete using (public.is_director());

-- SONG_FILES: todos ven; solo director sube/borra.
create policy "song_files_select_all" on song_files for select using (auth.uid() is not null);
create policy "song_files_write_director" on song_files for insert with check (public.is_director());
create policy "song_files_delete_director" on song_files for delete using (public.is_director());

-- SETLISTS: todos ven; solo director escribe.
create policy "setlists_select_all" on setlists for select using (auth.uid() is not null);
create policy "setlists_write_director" on setlists for insert with check (public.is_director());
create policy "setlists_update_director" on setlists for update using (public.is_director());
create policy "setlists_delete_director" on setlists for delete using (public.is_director());

create policy "setlist_songs_select_all" on setlist_songs for select using (auth.uid() is not null);
create policy "setlist_songs_write_director" on setlist_songs for insert with check (public.is_director());
create policy "setlist_songs_update_director" on setlist_songs for update using (public.is_director());
create policy "setlist_songs_delete_director" on setlist_songs for delete using (public.is_director());

-- TASKS: todos ven; solo director crea/edita/borra.
create policy "tasks_select_all" on tasks for select using (auth.uid() is not null);
create policy "tasks_write_director" on tasks for insert with check (public.is_director());
create policy "tasks_update_director" on tasks for update using (public.is_director());
create policy "tasks_delete_director" on tasks for delete using (public.is_director());

-- TASK_ASSIGNMENTS: el director ve/crea todo; cada miembro ve y actualiza SOLO lo suyo.
create policy "assignments_select_own_or_director" on task_assignments for select
  using (auth.uid() = user_id or public.is_director());
create policy "assignments_write_director" on task_assignments for insert
  with check (public.is_director());
create policy "assignments_update_own_or_director" on task_assignments for update
  using (auth.uid() = user_id or public.is_director());
create policy "assignments_delete_director" on task_assignments for delete
  using (public.is_director());

-- =========================================================
-- Storage policies (lectura pública, escritura solo autenticados)
-- =========================================================
create policy "partituras_read" on storage.objects for select using (bucket_id = 'partituras');
create policy "partituras_write" on storage.objects for insert with check (bucket_id = 'partituras' and auth.uid() is not null);
create policy "tareas_read" on storage.objects for select using (bucket_id = 'tareas');
create policy "tareas_write" on storage.objects for insert with check (bucket_id = 'tareas' and auth.uid() is not null);
