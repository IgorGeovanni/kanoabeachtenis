-- Garante que este UID seja o dono do sistema, não importa o estado atual
-- da tabela staff (cria a linha se não existir, ou corrige se já existir).
insert into public.staff (id, name, permissions, is_owner, status)
values ('1d3cba2f-fded-4c6c-8ea1-07d42689e098', 'Jean', '{}', true, 'ativo')
on conflict (id) do update set is_owner = true, status = 'ativo';

-- Mostra tudo que existe na tabela agora, pra conferirmos juntos.
select id, name, status, is_owner, permissions from public.staff;
