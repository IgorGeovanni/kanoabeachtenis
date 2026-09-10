-- ============================================================================
-- KANOA — MÓDULO DE MESAS/COMANDAS + IMAGENS DE PRODUTO
-- Rode este arquivo inteiro em: Supabase → SQL Editor → New query → Run
-- (é aditivo — não mexe em nada que já existe, só acrescenta)
-- ============================================================================

-- ============================================================================
-- 1. MESAS
-- ============================================================================
create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  created_at timestamptz not null default now()
);

-- Ajuste a quantidade aqui se precisar de mais ou menos mesas depois:
-- insert into public.restaurant_tables (number) select generate_series(51,60);
insert into public.restaurant_tables (number)
select generate_series(1, 50);

-- ============================================================================
-- 2. COMANDAS (uma "sessão" de atendimento em uma mesa)
-- ============================================================================
create table public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.restaurant_tables(id),
  customer_id uuid references public.customers(id),
  customer_name_snapshot text,
  customer_phone_snapshot text,
  people_count int not null default 1,
  service_charge_enabled boolean not null default true,
  cover_charge_enabled boolean not null default false,
  cover_charge_per_person numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opened_by uuid references auth.users(id),
  closed_by uuid references auth.users(id)
);
-- só pode existir UMA comanda aberta por mesa por vez
create unique index one_open_session_per_table
  on public.table_sessions (table_id)
  where closed_at is null;

-- ============================================================================
-- 3. ITENS CONSUMIDOS NA COMANDA
-- ============================================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.table_sessions(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id)
);

-- ============================================================================
-- SEGURANÇA (RLS) — só funcionário ativo mexe em mesas/comandas
-- ============================================================================
alter table public.restaurant_tables enable row level security;
alter table public.table_sessions enable row level security;
alter table public.order_items enable row level security;

create policy "staff access tables" on public.restaurant_tables for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access sessions" on public.table_sessions for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access order items" on public.order_items for all
  using (is_active_staff()) with check (is_active_staff());

-- ============================================================================
-- 4. IMAGEM NOS PRODUTOS
-- ============================================================================
alter table public.products add column if not exists image_url text;

-- Bucket de armazenamento para as fotos (público para leitura, só
-- funcionário logado pode enviar/trocar/apagar).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "staff upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "staff update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "staff delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');
