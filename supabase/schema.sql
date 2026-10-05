-- =============================================================================
-- A MORDIDAS — Esquema para un futuro panel de administración (Supabase / Postgres)
--
-- NO está conectado todavía. Hoy la carta vive en src/data/products.ts.
-- Este archivo deja lista la migración: ver docs/ADMIN.md → "Pasar a Supabase".
--
-- Seguridad:
--   * RLS activado en todas las tablas.
--   * El sitio público (clave "anon") solo LEE productos activos.
--   * Solo los usuarios listados en public.admins pueden crear/editar/borrar.
--   * La service_role key NUNCA va al frontend ni a variables NEXT_PUBLIC_*.
-- =============================================================================

create table if not exists public.categories (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label       text not null,
  singular    text not null,
  description text not null default '',
  sort_order  int  not null default 0
);

create table if not exists public.products (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 2 and 60),
  category_id text not null references public.categories(id) on update cascade,
  description text not null default '' check (char_length(description) <= 160),
  ingredients text[] not null check (cardinality(ingredients) > 0),
  price       integer check (price is null or price > 0),          -- pesos, null = "a confirmar"
  image_url   text not null,                                         -- Supabase Storage (bucket "products")
  image_alt   text not null check (char_length(image_alt) > 3),
  available   boolean not null default true,                         -- false = agotado por hoy
  active      boolean not null default true,                         -- false = fuera de carta
  featured    boolean not null default false,
  badge       text check (badge is null or char_length(badge) <= 16),
  tags        text[] not null default '{}',
  size        text,
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id, sort_order);

-- Quién puede administrar (se agrega a mano desde el panel de Supabase).
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- RLS
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.admins     enable row level security;

-- Lectura pública
create policy "categorias visibles" on public.categories
  for select using (true);
create policy "productos activos visibles" on public.products
  for select using (active or public.is_admin());

-- Escritura solo admins
create policy "admins gestionan categorias" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admins gestionan productos" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admins se ven a si mismos" on public.admins
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------- Datos iniciales
insert into public.categories (id, label, singular, description, sort_order) values
  ('sanguches',    'Sanguches',    'Sanguche',    'En pan de lomo gratinado o pan de molde tostado.', 1),
  ('hamburguesas', 'Hamburguesas', 'Hamburguesa', 'Medallones smash en pan gratinado.',               2)
on conflict (id) do nothing;
-- Los productos se cargan desde src/data/products.ts (ver docs/ADMIN.md).
