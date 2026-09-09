// ============================================================================
// CAMADA DE DADOS — agora conversando de verdade com o Supabase.
// Nenhum dado fica mais fixo no código: produtos, turnos e disponibilidade
// vêm do banco (ver supabase/schema.sql).
// ============================================================================
import { supabase } from "../supabaseClient";

export const DEFAULT_WHATSAPP_TEMPLATE =
  "Olá, {nome}! Seu agendamento para {data} às {horario} foi realizado com sucesso.";

export function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export function formatDateLabel(date) {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

// Planos/produtos da quadra, só os ativos.
export async function fetchCourtProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price")
    .eq("product_type", "court")
    .eq("status", "ativo")
    .order("price", { ascending: true });
  if (error) throw error;
  return data.map((p) => ({ id: p.id, name: p.name, desc: p.description, price: Number(p.price) }));
}

// Quais dias da semana têm pelo menos um turno cadastrado (para desenhar o
// calendário — dia sem turno aparece apagado/fechado).
export async function fetchOpenWeekdays() {
  const { data, error } = await supabase.from("court_shifts").select("weekday");
  if (error) throw error;
  return new Set(data.map((r) => r.weekday));
}

// Horários de um dia específico, já cruzados com os agendamentos existentes.
// Chama a function get_available_slots do banco (não expõe dados de clientes).
export async function fetchAvailability(date, court = 1) {
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_date: dateKey(date),
    p_court: court,
  });
  if (error) throw error;
  return data.map((row) => ({
    hour: row.start_time.slice(0, 5),
    shift: row.shift_label,
    available: row.is_available,
  }));
}

// Mensagem de confirmação configurada em Configurações (tabela settings).
export async function fetchWhatsappTemplate() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "whatsapp_message")
    .maybeSingle();
  if (error || !data) return DEFAULT_WHATSAPP_TEMPLATE;
  return data.value;
}

// Cria o agendamento de verdade. A function do banco cuida de: achar ou criar
// o cliente pelo telefone, e bloquear se o horário já tiver sido ocupado.
export async function createBooking({ nome, telefone, cpf, nascimento, productId, court = 1, date, time }) {
  const { data, error } = await supabase.rpc("create_booking", {
    p_customer_name: nome,
    p_customer_phone: telefone,
    p_customer_cpf: cpf || null,
    p_customer_birthdate: nascimento || null,
    p_product_id: productId,
    p_court: court,
    p_date: dateKey(date),
    p_time: time,
  });
  if (error) throw error;
  return data; // id do agendamento criado
}
