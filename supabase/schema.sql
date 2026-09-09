-- ============================================================================
-- KANOA — SCHEMA INICIAL DO BANCO (Supabase / Postgres)
-- Rode este arquivo inteiro em: Supabase → SQL Editor → New query → Run
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. CLIENTES
-- ============================================================================
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  cpf text,
  birthdate date,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_phone_idx on public.customers (phone);

-- ============================================================================
-- 2. PRODUTOS — quadra e bar no mesmo cadastro, diferenciados por product_type
-- ============================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (product_type in ('court','bar')),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text, -- usado só quando product_type = 'bar'
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 3. TURNOS DA QUADRA — por dia da semana (0=domingo ... 6=sábado)
-- ============================================================================
create table public.court_shifts (
  id uuid primary key default gen_random_uuid(),
  court_number int not null default 1,
  weekday int not null check (weekday between 0 and 6),
  label text not null,
  start_hour int not null check (start_hour between 0 and 23),
  end_hour int not null check (end_hour between 1 and 24),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. AGENDAMENTOS — o índice único abaixo é o que IMPEDE conflito de horário
-- ============================================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  product_id uuid references public.products(id),
  court_number int not null default 1,
  booking_date date not null,
  start_time time not null,
  booking_type text not null default 'avulso' check (booking_type in ('avulso','plano','clube')),
  status text not null default 'confirmado' check (status in ('confirmado','cancelado')),
  created_at timestamptz not null default now()
);
create unique index bookings_no_conflict
  on public.bookings (court_number, booking_date, start_time)
  where status = 'confirmado';

-- ============================================================================
-- 5. RECORRÊNCIAS
-- ============================================================================
create table public.recurring_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  product_id uuid references public.products(id),
  court_number int not null default 1,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  start_date date not null,
  end_date date,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 6. CLUBE / MENSALIDADE
-- ============================================================================
create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  monthly_fee numeric(10,2) not null default 0,
  reference_month date not null, -- sempre dia 1 do mês de referência
  paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (customer_id, reference_month)
);

-- ============================================================================
-- 7. VENDAS
-- ============================================================================
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  sale_date date not null default current_date,
  sale_type text not null default 'avulso' check (sale_type in ('avulso','recorrente')),
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null
);

-- ============================================================================
-- 8. FUNCIONÁRIOS — ligado ao login real do Supabase (auth.users)
-- ============================================================================
create table public.staff (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  permissions text[] not null default '{}',
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 9. CONFIGURAÇÕES (chave/valor flexível — nome da empresa, mensagem do whatsapp etc.)
-- ============================================================================
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 10. HISTÓRICO / AUDITORIA
-- ============================================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- FUNÇÕES DE PERMISSÃO — usadas pelas regras de segurança abaixo
-- ============================================================================
create or replace function public.is_active_staff()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.staff where id = auth.uid() and status = 'ativo');
$$;

create or replace function public.staff_has_permission(module text)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.staff
    where id = auth.uid() and status = 'ativo'
      and (is_owner = true or module = any(permissions))
  );
$$;

-- ============================================================================
-- FUNÇÃO PÚBLICA: consultar horários disponíveis (não expõe dados de clientes)
-- ============================================================================
create or replace function public.get_available_slots(p_date date, p_court int default 1)
returns table(start_time time, shift_label text, is_available boolean)
language sql stable security definer as $$
  select s.slot_time, s.label,
    not exists (
      select 1 from public.bookings b
      where b.booking_date = p_date and b.court_number = p_court
        and b.start_time = s.slot_time and b.status = 'confirmado'
    )
  from (
    select generate_series(
             make_time(cs.start_hour, 0, 0),
             make_time(cs.end_hour - 1, 0, 0),
             interval '1 hour'
           )::time as slot_time,
           cs.label
    from public.court_shifts cs
    where cs.weekday = extract(dow from p_date)::int and cs.court_number = p_court
  ) s
  order by s.slot_time;
$$;

-- ============================================================================
-- FUNÇÃO PÚBLICA: criar agendamento com segurança
-- (impede conflito de horário e evita cliente duplicado pelo telefone)
-- ============================================================================
create or replace function public.create_booking(
  p_customer_name text,
  p_customer_phone text,
  p_customer_cpf text,
  p_customer_birthdate date,
  p_product_id uuid,
  p_court int,
  p_date date,
  p_time time
) returns uuid
language plpgsql security definer as $$
declare
  v_customer_id uuid;
  v_booking_id uuid;
begin
  select id into v_customer_id from public.customers where phone = p_customer_phone limit 1;
  if v_customer_id is null then
    insert into public.customers (name, phone, cpf, birthdate)
    values (p_customer_name, p_customer_phone, p_customer_cpf, p_customer_birthdate)
    returning id into v_customer_id;
  end if;

  insert into public.bookings (customer_id, product_id, court_number, booking_date, start_time, booking_type)
  values (v_customer_id, p_product_id, p_court, p_date, p_time, 'avulso')
  returning id into v_booking_id;

  return v_booking_id;
exception
  when unique_violation then
    raise exception 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.';
end;
$$;

grant execute on function public.get_available_slots to anon, authenticated;
grant execute on function public.create_booking to anon, authenticated;

-- ============================================================================
-- REGRAS DE SEGURANÇA (RLS) — por padrão, ninguém acessa nada; só o que for
-- liberado abaixo. Escrita de agendamento/cliente pelo site público passa
-- SEMPRE pelas funções acima, nunca direto nas tabelas.
-- ============================================================================
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.court_shifts enable row level security;
alter table public.bookings enable row level security;
alter table public.recurring_bookings enable row level security;
alter table public.club_memberships enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.staff enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

-- Público: só lê produtos de quadra ativos (para montar a tela de agendamento)
create policy "public read active court products" on public.products
  for select using (status = 'ativo' and product_type = 'court');

-- Funcionário ativo: acesso operacional às tabelas do dia a dia
create policy "staff access customers" on public.customers for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access products" on public.products for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access bookings" on public.bookings for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access recurring" on public.recurring_bookings for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access club" on public.club_memberships for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access sales" on public.sales for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff access sale_items" on public.sale_items for all
  using (is_active_staff()) with check (is_active_staff());
create policy "staff insert audit" on public.audit_logs for insert
  with check (is_active_staff());

-- Dono: gerencia turnos, funcionários e configurações
create policy "owner manage shifts" on public.court_shifts for all
  using (staff_has_permission('Configurações')) with check (staff_has_permission('Configurações'));
create policy "staff read own row" on public.staff for select using (id = auth.uid());
create policy "owner manage staff" on public.staff for all
  using (exists (select 1 from public.staff s where s.id = auth.uid() and s.is_owner and s.status = 'ativo'));
create policy "owner manage settings" on public.settings for all
  using (staff_has_permission('Configurações')) with check (staff_has_permission('Configurações'));
create policy "owner read audit" on public.audit_logs for select
  using (exists (select 1 from public.staff s where s.id = auth.uid() and s.is_owner and s.status = 'ativo'));

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================
insert into public.products (product_type, name, description, price) values
  ('court', 'Day Use', 'Acesso avulso à quadra por 1 hora', 80),
  ('court', 'Aula Individual', 'Aula particular de 1 hora com professor', 120),
  ('court', 'Pacote Semanal', '1 sessão semanal recorrente', 150),
  ('court', 'Pacote Mensal', '4 sessões semanais recorrentes', 450);

insert into public.court_shifts (weekday, label, start_hour, end_hour) values
  (0, 'Manhã', 8, 12),
  (1, 'Manhã', 8, 11), (1, 'Tarde', 13, 17), (1, 'Noite', 18, 22),
  (2, 'Manhã', 8, 11), (2, 'Tarde', 13, 17), (2, 'Noite', 18, 22),
  (3, 'Manhã', 8, 11), (3, 'Tarde', 13, 17), (3, 'Noite', 18, 22),
  (4, 'Manhã', 8, 11), (4, 'Tarde', 13, 17), (4, 'Noite', 18, 22),
  (5, 'Manhã', 8, 11), (5, 'Tarde', 13, 17), (5, 'Noite', 18, 22),
  (6, 'Manhã', 8, 11), (6, 'Tarde', 13, 17), (6, 'Noite', 18, 22);

insert into public.settings (key, value) values
  ('company', '{"name": "Kanoa", "phone": ""}'),
  ('whatsapp_message', '"Olá, {nome}! Seu agendamento para {data} às {horario} foi realizado com sucesso."');
