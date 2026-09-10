-- Liga cada agendamento gerado por uma recorrência de volta a ela — assim,
-- ao cancelar a recorrência, dá para cancelar só os agendamentos futuros
-- que vieram dela, sem mexer nos agendamentos avulsos de ninguém.
alter table public.bookings
  add column if not exists recurring_booking_id uuid references public.recurring_bookings(id);
