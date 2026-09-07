# Emmanuel — App del Ministerio de Alabanza

App web para gestionar el repertorio dominical, partituras, tareas semanales y
seguimiento del equipo. Hecha con **Next.js** + **Supabase**.

## ¿Qué incluye?

- **Login / registro** con roles: `director` y `miembro`.
- **Cancionero**: crear canciones y subir partituras, cifrados y audios (PDF/MP3).
- **Repertorio Dominical**: el director elige las canciones de cada domingo, el orden
  y la sección (Apertura, Clímax, Salida, etc).
- **Tareas semanales**: el director crea tareas, las asigna a integrantes específicos
  (por instrumento o persona), y cada quien marca su avance (pendiente / en progreso /
  completada) y puede subir un audio/video de su práctica.
- **Equipo**: el director ve el progreso de cada integrante y puede ascenderlo a
  director o desactivarlo.

No necesitas saber programar para publicarla: solo copiar/pegar en dos paneles web.
Tiempo estimado: 20-30 minutos la primera vez.

---

## Paso 1 — Crear el proyecto en Supabase (base de datos + login + archivos)

1. Ve a **https://supabase.com** → "Start your project" → crea una cuenta gratis.
2. Clic en **New project**. Ponle un nombre (ej. `emmanuel-alabanza`), elige una
   contraseña para la base de datos (guárdala) y la región más cercana (ej. South
   America).
3. Espera ~2 minutos a que se cree.
4. En el menú lateral ve a **SQL Editor** → **New query**.
5. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** su
   contenido, pégalo ahí, y dale **Run**. Esto crea todas las tablas, los buckets de
   archivos y los permisos de seguridad.
6. Ve a **Project Settings** (ícono de engrane) → **API**. Copia:
   - **Project URL**
   - **anon public key**

   Los vas a necesitar en el paso 3.

## Paso 2 — Subir el código a GitHub

1. Crea una cuenta gratis en **https://github.com** si no tienes.
2. Crea un repositorio nuevo (puede ser privado), ej. `emmanuel-app`.
3. Sube todos los archivos de esta carpeta a ese repositorio (puedes arrastrar los
   archivos desde la web de GitHub con "Add file → Upload files", o usando git si
   sabes usarlo).

## Paso 3 — Publicar en Vercel (esto le da la URL pública a la app)

1. Ve a **https://vercel.com** → crea cuenta gratis (puedes entrar con tu cuenta de
   GitHub directamente).
2. Clic en **Add New... → Project**, y selecciona el repositorio `emmanuel-app` que
   subiste.
3. En **Environment Variables**, agrega estas dos (con los valores que copiaste del
   Paso 1):
   - `NEXT_PUBLIC_SUPABASE_URL` → tu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → tu anon public key
4. Clic en **Deploy**. Espera 1-2 minutos.
5. ¡Listo! Vercel te da una URL como `https://emmanuel-app.vercel.app` — esa es la
   dirección que compartes con tu equipo.

## Paso 4 — Crear tu cuenta de Director

1. Entra a la URL que te dio Vercel y ve a "Registrarme". Crea tu cuenta normal
   (quedará como "miembro" por defecto).
2. Ve a **Supabase → Table Editor → profiles**, busca tu usuario y cambia la columna
   `role` de `miembro` a `director` manualmente (haz doble clic en la celda).
3. Recarga la app — ya verás las opciones de director (crear canciones, repertorio,
   tareas, y administrar el equipo).
4. Desde ahí, ya puedes ascender a más directores/líderes desde la pantalla
   **Equipo** sin volver a tocar Supabase.

## Paso 5 — Invitar a tu equipo

Cada integrante entra a la misma URL, toca "Registrarme", pone su nombre e
instrumento, y ya puede ver el repertorio, sus tareas asignadas y subir sus
prácticas. Por defecto todos entran como "miembro" — solo tú decides quién más
tiene permisos de director.

---

## Desarrollo local (opcional, si más adelante quieres seguir modificando el código)

```bash
npm install
cp .env.local.example .env.local   # y pon ahí tus llaves de Supabase
npm run dev
```

Abre `http://localhost:3000`.

## Estructura del proyecto

```
app/
  login/            → inicio de sesión y registro
  dashboard/         → pantalla principal (próximo domingo)
  canciones/          → cancionero + subir partituras/cifrados/audios
  setlist/            → armar el repertorio de cada domingo (director)
  tareas/             → tareas semanales, asignación y seguimiento
  equipo/             → integrantes, progreso y roles
lib/supabase/        → conexión a la base de datos
components/           → piezas de interfaz reutilizables
supabase/schema.sql  → TODO el esquema de base de datos (ejecutar una sola vez)
```

## Próximos pasos sugeridos (cuando quieras seguir creciendo la app)

- Notificaciones por correo cuando se asigna una tarea nueva o se acerca la fecha
  límite.
- Descarga del setlist en PDF con un clic.
- Vista de "Modo Atril" a pantalla completa para usar en el escenario.
- Historial de asistencia a ensayos.

Cuando quieras cualquiera de estos, dime y lo construimos.
