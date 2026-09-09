// ============================================================================
// DADOS DA QUADRA — por enquanto gerados localmente (mock).
// Quando o Supabase estiver configurado, troque `getAvailability` para buscar
// os horários reais da tabela `bookings` e `PRODUCTS` para vir da tabela
// `products` (product_type = 'court', status = 'ativo').
// ============================================================================

// A quadra funciona por turnos, com intervalos entre eles — e cada dia da
// semana pode ter turnos diferentes (ex.: domingo mais curto que os demais).
// Chaves seguem o Date.getDay() do JavaScript: 0 = domingo ... 6 = sábado.
// Ajustável aqui (e, no futuro, pela tela de Configurações do painel).
const WEEKDAY_SHIFTS = [
  { id: "manha", label: "Manhã", start: 8, end: 11 },
  { id: "tarde", label: "Tarde", start: 13, end: 17 },
  { id: "noite", label: "Noite", start: 18, end: 22 },
];

export const SCHEDULE = {
  0: [{ id: "dom-manha", label: "Manhã", start: 8, end: 12 }], // domingo: turno único e mais curto
  1: WEEKDAY_SHIFTS,
  2: WEEKDAY_SHIFTS,
  3: WEEKDAY_SHIFTS,
  4: WEEKDAY_SHIFTS,
  5: WEEKDAY_SHIFTS,
  6: WEEKDAY_SHIFTS,
};

function buildSlots(shifts) {
  const slots = [];
  shifts.forEach((shift) => {
    for (let h = shift.start; h < shift.end; h++) {
      slots.push({ hour: `${String(h).padStart(2, "0")}:00`, shift: shift.label, shiftId: shift.id });
    }
  });
  return slots;
}

export const PRODUCTS = [
  { id: 1, name: "Day Use", desc: "Acesso avulso à quadra por 1 hora", price: 80 },
  { id: 2, name: "Aula Individual", desc: "Aula particular de 1 hora com professor", price: 120 },
  { id: 3, name: "Pacote Semanal", desc: "1 sessão semanal recorrente", price: 150 },
  { id: 4, name: "Pacote Mensal", desc: "4 sessões semanais recorrentes", price: 450 },
];

export const WHATSAPP_TEMPLATE =
  "Olá, {nome}! Seu agendamento para {data} às {horario} foi realizado com sucesso.";

export function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

// Hash simples e determinístico a partir da string da data, só para o
// protótipo variar a disponibilidade dia a dia sem precisar de backend.
function seedFromDate(key) {
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  return seed;
}

// Recebe um objeto Date. Usa o dia da semana para decidir QUAIS turnos
// existem, e a data completa para variar quais horários já estão ocupados.
export function getAvailability(date) {
  const shifts = SCHEDULE[date.getDay()] || [];
  const slots = buildSlots(shifts);
  const seed = seedFromDate(dateKey(date));
  return slots.map((slot, i) => ({ ...slot, available: ((seed >> i) & 3) !== 0 }));
}

export function formatDateLabel(date) {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}
