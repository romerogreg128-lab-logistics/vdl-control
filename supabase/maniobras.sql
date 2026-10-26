-- Tabla de maniobras: servicio independiente que el cliente paga aparte de las rutas.
-- Ejecutar una vez en Supabase → SQL Editor.

create table if not exists public.maniobras (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  fecha       date not null,
  cliente_id  text not null,           -- nombre del cliente (igual que rutas.cliente_id)
  operador    text,
  cantidad    integer not null default 1 check (cantidad > 0),
  tarifa      numeric(12,2) not null default 800,  -- precio por maniobra, sin IVA
  notas       text
);

create index if not exists maniobras_fecha_idx on public.maniobras (fecha);

-- Mismo acceso que usa la app para el resto de las tablas (llave anon).
alter table public.maniobras enable row level security;
drop policy if exists "maniobras_app" on public.maniobras;
create policy "maniobras_app" on public.maniobras
  for all to anon, authenticated
  using (true) with check (true);
