-- Atualiza a function de agendamento público para também registrar no
-- histórico (audit_logs) quando um cliente agenda direto pelo site.
-- É seguro rodar de novo — apenas substitui a function existente.

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

  insert into public.audit_logs (actor, action, entity, entity_id, details)
  values (
    null,
    'Cliente agendou pela página pública',
    'booking',
    v_booking_id::text,
    jsonb_build_object('cliente', p_customer_name, 'telefone', p_customer_phone, 'data', p_date, 'horario', p_time)
  );

  return v_booking_id;
exception
  when unique_violation then
    raise exception 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.';
end;
$$;
