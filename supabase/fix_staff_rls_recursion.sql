-- Corrige recursão infinita na política de segurança da tabela staff.
-- A política antiga consultava a própria tabela staff dentro de si mesma.
-- A solução é usar uma function "security definer", que consulta a tabela
-- sem passar pelas regras de segurança de novo (evitando o loop).

drop policy if exists "owner manage staff" on public.staff;

create or replace function public.is_owner_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.staff
    where id = auth.uid() and is_owner = true and status = 'ativo'
  );
$$;

create policy "owner manage staff" on public.staff for all
  using (is_owner_staff())
  with check (is_owner_staff());
