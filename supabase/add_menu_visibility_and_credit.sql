-- ============================================================================
-- KANOA — VISIBILIDADE DE PRODUTO NO CARDÁPIO + CREDIÁRIO / DEVEDORES
-- Rode este arquivo inteiro em: Supabase → SQL Editor → New query → Run
-- (confirme que está no projeto KanoaBeachTenis antes de rodar)
-- ============================================================================

-- ============================================================================
-- 1. VISIBILIDADE DO PRODUTO — só painel (mesas) ou painel + cardápio público
-- ============================================================================
alter table public.products
  add column if not exists show_in_menu boolean not null default true;

-- ============================================================================
-- 2. CREDIÁRIO NAS MESAS — marca um pagamento dividido como "fiado"
-- ============================================================================
alter table public.table_session_payments
  add column if not exists is_credit boolean not null default false;
alter table public.table_session_payments
  add column if not exists customer_id uuid references public.customers(id);
alter table public.table_session_payments
  add column if not exists debt_id uuid;

-- ============================================================================
-- 3. DEVEDORES — o que cada cliente ficou devendo, e quando foi quitado
-- ============================================================================
create table public.customer_debts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  table_session_id uuid references public.table_sessions(id),
  amount numeric(10,2) not null check (amount > 0),
  description text,
  status text not null default 'pendente' check (status in ('pendente','pago')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  paid_at timestamptz,
  paid_by uuid references auth.users(id)
);

alter table public.customer_debts enable row level security;

-- IMPORTANTE: diferente da maioria das outras tabelas (que qualquer
-- funcionário ativo acessa), esta aqui exige a permissão específica
-- "Devedores" marcada no cadastro do funcionário — de verdade, no banco,
-- não só escondendo a aba na tela.
create policy "permitted staff access debts" on public.customer_debts for all
  using (staff_has_permission('Devedores'))
  with check (staff_has_permission('Devedores'));

alter table public.table_session_payments
  add constraint table_session_payments_debt_id_fkey
  foreign key (debt_id) references public.customer_debts(id);
