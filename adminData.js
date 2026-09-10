import { supabase } from "../supabaseClient";

export const MODULES_LIST = [
  "Dashboard", "Agenda", "Agendar Cliente", "Mesas", "Cardápio / Produtos do Bar",
  "Planos da Quadra", "Clientes (CRM)", "Vendas", "Relatórios", "Configurações", "Funcionários",
];

export const DAYS_OF_WEEK = [
  { id: 0, short: "Dom", label: "Domingo" },
  { id: 1, short: "Seg", label: "Segunda" },
  { id: 2, short: "Ter", label: "Terça" },
  { id: 3, short: "Qua", label: "Quarta" },
  { id: 4, short: "Qui", label: "Quinta" },
  { id: 5, short: "Sex", label: "Sexta" },
  { id: 6, short: "Sáb", label: "Sábado" },
];

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

/* ===================== AUTENTICAÇÃO / FUNCIONÁRIO LOGADO ===================== */

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Busca o registro em public.staff do usuário logado (nome, permissões, se é dono).
export async function fetchMyStaffRecord() {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase.from("staff").select("*").eq("id", uid).maybeSingle();
  if (error) throw error;
  return data;
}

/* ===================== AGENDA / AGENDAMENTOS ===================== */

export async function fetchShiftsForWeekday(weekday, court = 1) {
  const { data, error } = await supabase
    .from("court_shifts")
    .select("*")
    .eq("weekday", weekday)
    .eq("court_number", court)
    .order("start_hour");
  if (error) throw error;
  return data;
}

export async function fetchBookingsForDate(date, court = 1) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_time, booking_type, status, customers(id, name, phone), products(name)")
    .eq("booking_date", dateKey(date))
    .eq("court_number", court)
    .eq("status", "confirmado")
    .order("start_time");
  if (error) throw error;
  return data;
}

export async function cancelBooking(id) {
  const { error } = await supabase.from("bookings").update({ status: "cancelado" }).eq("id", id);
  if (error) throw error;
}

/* ===================== CLIENTES / CRM ===================== */

export async function searchCustomers(query, statusFilter = "ativo") {
  let q = supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (statusFilter !== "todos") q = q.eq("status", statusFilter);
  if (query) q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%,cpf.ilike.%${query}%`);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data;
}

export async function createCustomer({ name, phone, cpf, birthdate }) {
  const { error } = await supabase.from("customers").insert({
    name, phone, cpf: cpf || null, birthdate: birthdate || null,
  });
  if (error) throw error;
}

export async function setCustomerStatus(id, status) {
  const { error } = await supabase.from("customers").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchCustomerBookings(customerId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_date, start_time, booking_type, status, products(name, price)")
    .eq("customer_id", customerId)
    .order("booking_date", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function fetchClubMembership(customerId) {
  const { data, error } = await supabase
    .from("club_memberships")
    .select("*")
    .eq("customer_id", customerId)
    .order("reference_month", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function activateClub(customerId, monthlyFee = 220) {
  const referenceMonth = new Date();
  referenceMonth.setDate(1);
  const { error } = await supabase.from("club_memberships").insert({
    customer_id: customerId,
    monthly_fee: monthlyFee,
    reference_month: dateKey(referenceMonth),
    paid: false,
  });
  if (error) throw error;
}

export async function payClubMembership(membershipId) {
  const { error } = await supabase
    .from("club_memberships")
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq("id", membershipId);
  if (error) throw error;
}

/* ===================== PRODUTOS (QUADRA E BAR) ===================== */

export async function fetchProducts(productType) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("product_type", productType)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { error } = await supabase.from("products").insert(product);
  if (error) throw error;
}

export async function updateProduct(id, fields) {
  const { error } = await supabase.from("products").update(fields).eq("id", id);
  if (error) throw error;
}

export async function toggleProductStatus(id, currentStatus) {
  await updateProduct(id, { status: currentStatus === "ativo" ? "inativo" : "ativo" });
}

/* ===================== VENDAS ===================== */

/* ===================== MESAS / COMANDAS ===================== */

export async function fetchTablesWithStatus() {
  const { data: tables, error: tErr } = await supabase.from("restaurant_tables").select("*").order("number");
  if (tErr) throw tErr;
  const { data: sessions, error: sErr } = await supabase
    .from("table_sessions")
    .select("id, table_id, customer_id, customer_name_snapshot, customer_phone_snapshot, people_count, opened_at, customers(name, phone)")
    .is("closed_at", null);
  if (sErr) throw sErr;
  const byTable = {};
  sessions.forEach((s) => { byTable[s.table_id] = s; });
  return tables.map((t) => ({ ...t, session: byTable[t.id] || null }));
}

export async function findCustomerByPhone(phone) {
  const { data, error } = await supabase.from("customers").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  return data;
}

export async function openTableSession({ tableId, customerId, customerName, customerPhone, peopleCount }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("table_sessions").insert({
    table_id: tableId,
    customer_id: customerId || null,
    customer_name_snapshot: customerName || null,
    customer_phone_snapshot: customerPhone || null,
    people_count: peopleCount || 1,
    opened_by: userData?.user?.id || null,
  });
  if (error) throw error;
}

export async function fetchSessionItems(sessionId) {
  const { data, error } = await supabase
    .from("order_items")
    .select("id, quantity, unit_price, products(name)")
    .eq("session_id", sessionId)
    .order("added_at");
  if (error) throw error;
  return data;
}

export async function addOrderItem({ sessionId, productId, quantity, unitPrice }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("order_items").insert({
    session_id: sessionId, product_id: productId, quantity, unit_price: unitPrice, added_by: userData?.user?.id || null,
  });
  if (error) throw error;
}

export async function updateOrderItemQuantity(id, quantity) {
  const { error } = await supabase.from("order_items").update({ quantity }).eq("id", id);
  if (error) throw error;
}

export async function removeOrderItem(id) {
  const { error } = await supabase.from("order_items").delete().eq("id", id);
  if (error) throw error;
}

export async function closeTableSession(sessionId, { serviceChargeEnabled, coverChargeEnabled, coverChargePerPerson, subtotal, total }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("table_sessions").update({
    closed_at: new Date().toISOString(),
    service_charge_enabled: serviceChargeEnabled,
    cover_charge_enabled: coverChargeEnabled,
    cover_charge_per_person: coverChargePerPerson,
    subtotal,
    total,
    closed_by: userData?.user?.id || null,
  }).eq("id", sessionId);
  if (error) throw error;
}

/* ===================== IMAGEM DE PRODUTO ===================== */

export async function uploadProductImage(file) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchAllActiveProducts() {
  const { data, error } = await supabase.from("products").select("*").eq("status", "ativo").order("name");
  if (error) throw error;
  return data;
}

export async function fetchSales() {
  const { data, error } = await supabase
    .from("sales")
    .select("id, sale_date, sale_type, total, customers(name), sale_items(quantity, unit_price, products(name))")
    .order("sale_date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function createSale({ customerId, productId, quantity, unitPrice, saleType }) {
  const total = quantity * unitPrice;
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({ customer_id: customerId, sale_type: saleType, total })
    .select()
    .single();
  if (saleError) throw saleError;
  const { error: itemError } = await supabase
    .from("sale_items")
    .insert({ sale_id: sale.id, product_id: productId, quantity, unit_price: unitPrice });
  if (itemError) throw itemError;
  return sale;
}

/* ===================== TURNOS DA QUADRA ===================== */

export async function fetchAllShifts(court = 1) {
  const { data, error } = await supabase
    .from("court_shifts")
    .select("*")
    .eq("court_number", court)
    .order("weekday")
    .order("start_hour");
  if (error) throw error;
  return data;
}

export async function createShift({ weekday, label, start_hour, end_hour, court_number = 1 }) {
  const { error } = await supabase.from("court_shifts").insert({ weekday, label, start_hour, end_hour, court_number });
  if (error) throw error;
}

export async function updateShift(id, fields) {
  const { error } = await supabase.from("court_shifts").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteShift(id) {
  const { error } = await supabase.from("court_shifts").delete().eq("id", id);
  if (error) throw error;
}

/* ===================== FUNCIONÁRIOS ===================== */

export async function fetchStaff() {
  const { data, error } = await supabase.from("staff").select("*").order("created_at");
  if (error) throw error;
  return data;
}

// id aqui é o UID do usuário já criado em Authentication → Users no Supabase.
export async function upsertStaff({ id, name, status, permissions }) {
  const { error } = await supabase.from("staff").upsert({ id, name, status, permissions });
  if (error) throw error;
}

export async function toggleStaffStatus(id, currentStatus) {
  const { error } = await supabase
    .from("staff")
    .update({ status: currentStatus === "ativo" ? "inativo" : "ativo" })
    .eq("id", id);
  if (error) throw error;
}

/* ===================== CONFIGURAÇÕES GERAIS ===================== */

export async function fetchSetting(key, fallback = null) {
  const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  if (error || !data) return fallback;
  return data.value;
}

export async function saveSetting(key, value) {
  const { error } = await supabase.from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/* ===================== DASHBOARD (indicadores simples e reais) ===================== */

export async function fetchDashboardStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const [{ count: activeCustomers }, { count: bookingsThisMonth }, { count: activeClubMembers }] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmado")
      .gte("booking_date", dateKey(startOfMonth)),
    supabase.from("club_memberships").select("id", { count: "exact", head: true }).eq("status", "ativo"),
  ]);
  return {
    activeCustomers: activeCustomers || 0,
    bookingsThisMonth: bookingsThisMonth || 0,
    activeClubMembers: activeClubMembers || 0,
  };
}

// Linhas cruas do mês (só data + horário) para montar os gráficos de
// horário de pico e dias de maior demanda, agregando no próprio navegador.
export async function fetchMonthBookingsRaw() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { data, error } = await supabase
    .from("bookings")
    .select("booking_date, start_time")
    .eq("status", "confirmado")
    .gte("booking_date", dateKey(startOfMonth));
  if (error) throw error;
  return data;
}
