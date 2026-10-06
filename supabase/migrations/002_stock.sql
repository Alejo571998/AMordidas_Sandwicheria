-- =============================================================================
-- A MORDIDAS — Stock por unidades (se ejecuta UNA vez, después de schema.sql)
--
-- Agrega:
--   * product_settings.stock: unidades que quedan hoy (null = sin límite).
--   * order_log: pedidos que descontaron stock (para que el dueño los controle).
--   * place_order(): descuenta stock de forma atómica al tocar "Enviar pedido".
--     Si no alcanza, no descuenta nada y devuelve cuánto queda de cada producto.
--     Cuando un producto llega a 0 se marca "agotado por hoy" (available = false).
--
-- Se puede volver a ejecutar sin romper nada.
-- =============================================================================

alter table public.product_settings
  add column if not exists stock integer check (stock is null or (stock >= 0 and stock <= 10000));

create table if not exists public.order_log (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  items      jsonb not null   -- [{ "product_id": "...", "quantity": n }]. Sin datos personales.
);

create index if not exists order_log_created_idx on public.order_log (created_at desc);

alter table public.order_log enable row level security;

drop policy if exists "admins ven los pedidos" on public.order_log;
create policy "admins ven los pedidos" on public.order_log
  for select to authenticated
  using ((select public.is_admin()));

revoke all on public.order_log from anon, authenticated;
grant select on public.order_log to authenticated;

-- ---------------------------------------------------------------- place_order
create or replace function public.place_order(items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  it record;
  current_row public.product_settings%rowtype;
  remaining integer;
  shortages jsonb := '[]'::jsonb;
  sold_out text[] := '{}';
  clean_items jsonb;
  recent integer;
  new_id bigint;
begin
  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) not between 1 and 30 then
    raise exception 'Pedido inválido' using errcode = '22023';
  end if;

  -- Freno contra abusos: si entran demasiados pedidos seguidos, no se descuenta (el pedido sale igual por WhatsApp).
  select count(*) into recent from public.order_log where created_at > now() - interval '10 minutes';
  if recent >= 40 then
    return jsonb_build_object('ok', false, 'reason', 'throttled');
  end if;

  -- Pedido normalizado: un renglón por producto.
  create temporary table if not exists pg_temp.order_items (product_id text, quantity integer) on commit drop;
  truncate pg_temp.order_items;
  insert into pg_temp.order_items (product_id, quantity)
  select e->>'product_id', sum((e->>'quantity')::integer)
  from jsonb_array_elements(items) e
  group by e->>'product_id';

  if exists (
    select 1 from pg_temp.order_items
    where product_id is null
       or product_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
       or quantity is null or quantity < 1 or quantity > 20
  ) then
    raise exception 'Pedido inválido' using errcode = '22023';
  end if;

  -- 1) Verificar. Las filas quedan bloqueadas (orden fijo, sin deadlocks) hasta terminar.
  for it in select * from pg_temp.order_items order by product_id loop
    select * into current_row from public.product_settings where product_id = it.product_id for update;
    if found then
      if not current_row.active or not current_row.available or coalesce(current_row.stock, 1) < 1 then
        shortages := shortages || jsonb_build_object('product_id', it.product_id, 'available', 0);
      elsif current_row.stock is not null and current_row.stock < it.quantity then
        shortages := shortages || jsonb_build_object('product_id', it.product_id, 'available', current_row.stock);
      end if;
    end if;
    -- Sin fila: sin límite (vale lo de la carta).
  end loop;

  if jsonb_array_length(shortages) > 0 then
    return jsonb_build_object('ok', false, 'reason', 'stock', 'shortages', shortages);
  end if;

  -- 2) Descontar. Al llegar a 0 queda "agotado por hoy".
  for it in select * from pg_temp.order_items order by product_id loop
    update public.product_settings
       set stock = stock - it.quantity,
           available = case when stock - it.quantity <= 0 then false else available end
     where product_id = it.product_id and stock is not null
    returning stock into remaining;
    if found and remaining = 0 then
      sold_out := array_append(sold_out, it.product_id);
    end if;
  end loop;

  select jsonb_agg(jsonb_build_object('product_id', product_id, 'quantity', quantity) order by product_id)
    into clean_items from pg_temp.order_items;
  insert into public.order_log (items) values (clean_items) returning id into new_id;
  delete from public.order_log where created_at < now() - interval '3 days';

  return jsonb_build_object('ok', true, 'order_id', new_id, 'sold_out', to_jsonb(sold_out));
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
