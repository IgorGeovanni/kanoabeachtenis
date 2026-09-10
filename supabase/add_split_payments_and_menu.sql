-- ============================================================================
-- KANOA — PAGAMENTO DIVIDIDO NAS MESAS + LIBERAR CARDÁPIO PÚBLICO
-- Rode este arquivo inteiro em: Supabase → SQL Editor → New query → Run
-- ============================================================================

-- ============================================================================
-- 1. PAGAMENTOS DA MESA (permite dividir a conta em quantas partes quiser,
--    cada uma com um valor diferente — não precisa ser dividido igual)
-- ============================================================================
create table public.table_session_payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.table_sessions(id) on delete cascade,
  payer_name text,
  amount numeric(10,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.table_session_payments enable row level security;

create policy "staff access session payments" on public.table_session_payments for all
  using (is_active_staff()) with check (is_active_staff());

-- ============================================================================
-- 2. CARDÁPIO PÚBLICO — libera leitura dos produtos do bar ativos para
--    visitantes não logados (o site público hoje só liberava produtos de
--    quadra; o cardápio precisa dos produtos do bar).
-- ============================================================================
create policy "public read active bar products" on public.products
  for select using (status = 'ativo' and product_type = 'bar');
