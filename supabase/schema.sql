-- =============================================================================
-- A MORDIDAS — Base del panel de administración (Supabase / Postgres)
--
-- Se ejecuta UNA vez en el SQL Editor del proyecto nuevo (ver docs/ADMIN.md).
-- Se puede volver a ejecutar sin romper nada.
--
-- Qué guarda: solo lo que el dueño cambia desde /admin (precio, stock, visibilidad).
-- Nombres, ingredientes y fotos siguen en src/data/products.ts.
--
-- Seguridad:
--   * RLS activado en las dos tablas.
--   * Cualquiera puede LEER precios (son públicos: están en la web).
--   * Solo las cuentas listadas en public.admins pueden cambiarlos.
--   * La clave secreta (service_role / sb_secret_) NUNCA va en la web ni en Vercel.
-- =============================================================================

-- ---------------------------------------------------------------- Tablas
create table if not exists public.product_settings (
  product_id  text primary key check (product_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  price       integer check (price is null or (price > 0 and price <= 1000000)),  -- pesos; null = "a confirmar"
  available   boolean not null default true,   -- false = "Por hoy se fue de vacaciones"
  active      boolean not null default true,   -- false = no aparece en la carta
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid() references auth.users (id) on delete set null
);

-- Quién puede administrar. Se agrega a mano (ver docs/ADMIN.md, paso 4).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- Funciones
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_product_settings()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

drop trigger if exists product_settings_touch on public.product_settings;
create trigger product_settings_touch
  before update on public.product_settings
  for each row execute function public.touch_product_settings();

-- ---------------------------------------------------------------- RLS
alter table public.product_settings enable row level security;
alter table public.admins enable row level security;

drop policy if exists "precios visibles para todos" on public.product_settings;
create policy "precios visibles para todos" on public.product_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "admins crean precios" on public.product_settings;
create policy "admins crean precios" on public.product_settings
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "admins cambian precios" on public.product_settings;
create policy "admins cambian precios" on public.product_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Sin política de DELETE: nadie borra filas desde la web.

drop policy if exists "cada admin se ve a sí mismo" on public.admins;
create policy "cada admin se ve a sí mismo" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Sin políticas de escritura en admins: solo se edita desde el panel de Supabase.

-- ---------------------------------------------------------------- Permisos
revoke all on public.product_settings from anon, authenticated;
grant select on public.product_settings to anon, authenticated;
grant insert, update on public.product_settings to authenticated;

revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;
