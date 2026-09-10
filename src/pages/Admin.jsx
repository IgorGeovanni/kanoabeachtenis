import { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarDays, Users, ClipboardList, UtensilsCrossed,
  Table2, ShoppingCart, FileBarChart, Settings, Search, Phone,
  MessageCircle, ChevronLeft, Plus, Minus, LogOut, Menu, Repeat, Wallet
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { BRAND } from "../brand";
import {
  MODULES_LIST, DAYS_OF_WEEK, dateKey,
  fetchShiftsForWeekday, fetchBookingsForDate, cancelBooking,
  searchCustomers, createCustomer, setCustomerStatus, fetchCustomerBookings,
  fetchClubMembership, activateClub, payClubMembership,
  fetchProducts, createProduct, updateProduct, toggleProductStatus,
  fetchSales, createSale, fetchAllActiveProducts,
  fetchAllShifts, createShift, updateShift, deleteShift,
  fetchStaff, upsertStaff, toggleStaffStatus,
  fetchSetting, saveSetting,
  fetchDashboardStats, fetchMonthBookingsRaw,
  fetchTablesWithStatus, findCustomerByPhone, openTableSession,
  fetchSessionItems, addOrderItem, updateOrderItemQuantity, removeOrderItem, closeTableSession,
  fetchSessionPayments, addSessionPayment, removeSessionPayment,
  fetchDebts, settleDebt,
  fetchRecurringBookings, createRecurringBooking, cancelRecurringBooking,
  uploadProductImage, fetchAuditLogs,
} from "../admin/adminData";

/* =========================================================================
   ESTILO — tokens vêm de src/brand.js, um único lugar pra trocar cor/logo.
   ========================================================================= */
const CSS = `
  :root {
    --bg:#F5F3EE; --surface:#FFFFFF; --surface-alt:#FBFAF6;
    --ink:#1C2430; --ink-soft:#636B78; --ink-faint:#9CA3AE; --border:#E4E1D8;
    --sidebar:${BRAND.colors.ink}; --sidebar-alt:#2A2622; --sidebar-text:#D8D0C6; --sidebar-text-dim:#8C8378;
    --brand:${BRAND.colors.accent}; --brand-deep:${BRAND.colors.accentDeep}; --brand-ink:#2C1B0C; --wood:${BRAND.colors.wood};
    --court:#1F7A6C; --court-soft:#E4F1EE;
    --bar:#A6472F; --bar-soft:#F3E4DE;
    --success:#2E8B57; --success-soft:#E4F3EA;
    --danger:#C1443C; --danger-soft:#FBEAE8;
    --warning:#E2A63B; --warning-soft:#FBF1DD;
    --info:#3A6EA5; --info-soft:#E6EEF6;
    --font-display:'Manrope',sans-serif; --font-body:'Inter',sans-serif;
  }
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');
  .bt-app{ display:flex; min-height:100vh; font-family:var(--font-body); background:var(--bg); color:var(--ink); position:relative; }
  .bt-app *{ box-sizing:border-box; }
  .bt-sidebar{ width:236px; background:var(--sidebar); color:var(--sidebar-text); flex-shrink:0; display:flex; flex-direction:column; padding:18px 12px; z-index:30; }
  .bt-sidebar-brand{ display:flex; align-items:center; gap:10px; padding:6px 8px 20px; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:14px; }
  .bt-logo-badge{ width:38px;height:38px;border-radius:11px;background:var(--brand);color:var(--brand-ink);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:17px; flex-shrink:0; overflow:hidden; }
  .bt-logo-badge img{ width:100%; height:100%; object-fit:cover; }
  .bt-brand-name{ font-family:var(--font-display); font-weight:700; font-size:14px; color:#fff; line-height:1.25; }
  .bt-brand-tag{ font-size:10.5px; color:var(--sidebar-text-dim); margin-top:1px; }
  .bt-nav-group{ margin-bottom:14px; }
  .bt-nav-group-label{ font-size:10.5px; letter-spacing:.05em; color:var(--sidebar-text-dim); padding:0 10px 6px; font-weight:700; }
  .bt-nav-item{ display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:9px; font-size:13.5px; color:var(--sidebar-text); cursor:pointer; margin-bottom:2px; }
  .bt-nav-item:hover{ background:var(--sidebar-alt); color:#fff; }
  .bt-nav-item.active{ background:var(--brand); color:var(--brand-ink); font-weight:700; }
  .bt-nav-item svg{ width:16px;height:16px; flex-shrink:0; }
  .bt-sidebar-foot{ margin-top:auto; padding:10px; font-size:11px; color:var(--sidebar-text-dim); border-top:1px solid rgba(255,255,255,.08); }
  .bt-main{ flex:1; display:flex; flex-direction:column; min-width:0; }
  .bt-topbar{ height:64px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 26px; background:var(--surface); flex-shrink:0; gap:14px; }
  .bt-topbar-title{ font-family:var(--font-display); font-weight:800; font-size:17px; }
  .bt-topbar-sub{ font-size:12px; color:var(--ink-soft); margin-top:1px; }
  .bt-content{ padding:24px 26px 40px; overflow-y:auto; flex:1; }
  .bt-card{ background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:18px; }
  .bt-card-title{ font-family:var(--font-display); font-weight:800; font-size:14.5px; }
  .bt-card-sub{ font-size:12px; color:var(--ink-soft); margin-top:2px; }
  .bt-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .bt-btn{ display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700; padding:8px 14px; border-radius:9px; border:1px solid transparent; cursor:pointer; font-family:var(--font-body); white-space:nowrap; }
  .bt-btn:disabled{ opacity:.5; cursor:not-allowed; }
  .bt-btn-primary{ background:var(--brand); color:var(--brand-ink); }
  .bt-btn-primary:hover{ background:var(--brand-deep); }
  .bt-btn-ghost{ background:transparent; border-color:var(--border); color:var(--ink); }
  .bt-btn-ghost:hover{ background:var(--surface-alt); }
  .bt-btn-danger{ background:var(--danger-soft); color:var(--danger); }
  .bt-btn-sm{ padding:5px 10px; font-size:12px; border-radius:7px; }
  .bt-badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; white-space:nowrap; }
  .bt-badge-success{ background:var(--success-soft); color:var(--success); }
  .bt-badge-danger{ background:var(--danger-soft); color:var(--danger); }
  .bt-badge-warning{ background:var(--warning-soft); color:#8A5F0F; }
  .bt-badge-court{ background:var(--court-soft); color:var(--court); }
  .bt-badge-bar{ background:var(--bar-soft); color:var(--bar); }
  .bt-badge-muted{ background:var(--surface-alt); color:var(--ink-soft); border:1px solid var(--border); }
  .bt-input,.bt-select,.bt-textarea{ width:100%; padding:9px 11px; border:1px solid var(--border); border-radius:8px; font-size:13.5px; font-family:var(--font-body); background:var(--surface); color:var(--ink); }
  .bt-input:focus,.bt-textarea:focus,.bt-select:focus{ outline:2px solid var(--brand); outline-offset:1px; border-color:var(--brand); }
  .bt-label{ font-size:12px; font-weight:700; color:var(--ink-soft); margin-bottom:5px; display:block; }
  .bt-field{ margin-bottom:14px; }
  .bt-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
  .bt-table th{ text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.03em; color:var(--ink-faint); font-weight:700; padding:9px 12px; border-bottom:1px solid var(--border); }
  .bt-table td{ padding:11px 12px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .bt-table tr:hover td{ background:var(--surface-alt); }
  .bt-toast{ position:fixed; bottom:22px; right:22px; background:var(--ink); color:#fff; padding:11px 18px; border-radius:10px; font-size:13px; z-index:200; box-shadow:0 8px 24px rgba(0,0,0,.2); max-width:340px; }
  .bt-overlay{ position:fixed; inset:0; background:rgba(20,33,54,.35); z-index:25; }
  .bt-occ-strip{ display:flex; gap:3px; margin-top:14px; }
  .bt-occ-block{ flex:1; height:34px; border-radius:5px; background:var(--border); }
  .bt-occ-block.busy{ background:var(--court); }
  .bt-occ-labels{ display:flex; gap:3px; margin-top:6px; }
  .bt-occ-labels span{ flex:1; text-align:center; font-size:9.5px; color:var(--ink-faint); }
  .bt-stat-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:14px; }
  .bt-stat-value{ font-family:var(--font-display); font-size:25px; font-weight:800; margin-top:6px; }
  .bt-stat-label{ font-size:12px; color:var(--ink-soft); }
  .bt-stat-pending{ border-style:dashed; background:var(--surface-alt); }
  .bt-panel-overlay{ position:fixed; inset:0; background:rgba(20,33,54,.38); z-index:60; display:flex; justify-content:flex-end; }
  .bt-panel{ width:430px; max-width:92vw; background:var(--surface); height:100%; overflow-y:auto; padding:22px; box-shadow:-10px 0 30px rgba(0,0,0,.18); }
  .bt-tabs{ display:flex; gap:4px; border-bottom:1px solid var(--border); margin-bottom:16px; }
  .bt-tab{ padding:9px 14px; font-size:13px; font-weight:700; color:var(--ink-soft); cursor:pointer; border-bottom:2px solid transparent; }
  .bt-tab.active{ color:var(--ink); border-color:var(--brand); }
  .bt-chip{ display:inline-flex; align-items:center; padding:6px 12px; border-radius:999px; border:1px solid var(--border); font-size:12px; cursor:pointer; background:var(--surface); font-weight:600; }
  .bt-chip.active{ background:var(--ink); color:#fff; border-color:var(--ink); }
  .bt-var-chip{ font-size:11px; font-family:monospace; background:var(--surface-alt); border:1px solid var(--border); padding:3px 8px; border-radius:6px; cursor:pointer; }
  .bt-grid-2{ display:grid; grid-template-columns:1.4fr 1fr; gap:16px; }
  .bt-grid-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .bt-bar-mini{ height:8px; border-radius:5px; background:var(--court); }
  .bt-bar-track{ height:8px; border-radius:5px; background:var(--border); flex:1; }
  .bt-avatar{ width:34px;height:34px;border-radius:50%; background:var(--court-soft); color:var(--court); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; font-family:var(--font-display); flex-shrink:0; }
  .bt-tables-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); gap:13px; }
  .bt-table-card{ border:1.6px solid var(--border); border-radius:12px; padding:12px; cursor:pointer; background:var(--surface); transition:transform .12s ease, box-shadow .12s ease; }
  .bt-table-card:hover{ transform:translateY(-2px); box-shadow:0 8px 18px rgba(20,33,54,.09); }
  .bt-table-card.st-ocupada{ border-color:var(--brand); background:var(--warning-soft); }
  .bt-table-num{ font-family:var(--font-display); font-weight:800; font-size:15px; }
  .bt-item-row{ display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid var(--border); font-size:13.5px; gap:8px; }
  .bt-qty-btn{ width:22px;height:22px;border-radius:6px;border:1px solid var(--border);background:var(--surface-alt);cursor:pointer;font-size:13px;line-height:1;display:inline-flex;align-items:center;justify-content:center; }
  .bt-photo-thumb{ width:44px; height:44px; border-radius:8px; object-fit:cover; flex-shrink:0; background:var(--surface-alt); }
  .bt-menu-btn{ display:none; align-items:center; justify-content:center; width:34px; height:34px; border-radius:8px; border:1px solid var(--border); background:var(--surface); cursor:pointer; flex-shrink:0; }
  @media (max-width: 900px){
    .bt-grid-2, .bt-grid-3{ grid-template-columns:1fr; }
    .bt-sidebar{ position:fixed; left:0; top:0; bottom:0; transform:translateX(-100%); transition:transform .2s ease; }
    .bt-sidebar.open{ transform:translateX(0); }
    .bt-menu-btn{ display:inline-flex; }
    .bt-card{ overflow-x:auto; }
    .bt-content{ padding:18px 14px 32px; }
  }
`;

function formatBRL(n) {
  return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}
function buildSlotsFromShifts(shifts) {
  const slots = [];
  shifts.forEach((shift) => {
    for (let h = shift.start_hour; h < shift.end_hour; h++) {
      slots.push({ hour: `${String(h).padStart(2, "0")}:00`, shift: shift.label, shiftId: shift.id });
    }
  });
  return slots;
}
function openWhatsapp(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return;
  const full = digits.length <= 11 ? `55${digits}` : digits;
  window.open(`https://wa.me/${full}`, "_blank");
}

function StatusBadge({ status }) {
  const map = {
    ativo: { cls: "bt-badge-success", label: "Ativo" },
    inativo: { cls: "bt-badge-danger", label: "Inativo" },
  };
  const m = map[status] || { cls: "bt-badge-muted", label: status };
  return <span className={`bt-badge ${m.cls}`}>{m.label}</span>;
}

const NAV_GROUPS = [
  { label: null, items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permKey: "Dashboard" }] },
  { label: "Quadra", items: [
    { id: "agenda", label: "Agenda", icon: CalendarDays, permKey: "Agenda" },
    { id: "recorrencias", label: "Recorrências", icon: Repeat, permKey: "Recorrências" },
    { id: "planosQuadra", label: "Planos da Quadra", icon: ClipboardList, permKey: "Planos da Quadra" },
  ]},
  { label: "Bar", items: [
    { id: "mesas", label: "Mesas", icon: Table2, permKey: "Mesas" },
    { id: "produtosBar", label: "Cardápio / Produtos", icon: UtensilsCrossed, permKey: "Cardápio / Produtos do Bar" },
  ]},
  { label: "Relacionamento", items: [{ id: "clientes", label: "Clientes (CRM)", icon: Users, permKey: "Clientes (CRM)" }] },
  { label: "Gestão", items: [
    { id: "vendas", label: "Vendas", icon: ShoppingCart, permKey: "Vendas" },
    { id: "devedores", label: "Devedores", icon: Wallet, permKey: "Devedores" },
    { id: "relatorios", label: "Relatórios", icon: FileBarChart, permKey: "Relatórios" },
    { id: "config", label: "Configurações", icon: Settings, permKey: "Configurações" },
  ]},
];

const VIEW_META = {
  dashboard: { title: "Dashboard", sub: "Visão geral da operação" },
  agenda: { title: "Agenda", sub: "Reservas e disponibilidade da quadra" },
  recorrencias: { title: "Recorrências", sub: "Clientes com horário fixo toda semana" },
  planosQuadra: { title: "Planos da Quadra", sub: "Produtos vendidos para o agendamento da quadra" },
  mesas: { title: "Mesas", sub: "Controle de mesas e comandas do bar" },
  produtosBar: { title: "Cardápio / Produtos do Bar", sub: "Itens disponíveis para venda no bar" },
  clientes: { title: "Clientes", sub: "CRM — relacionamento completo com o cliente" },
  vendas: { title: "Vendas", sub: "Lançamentos avulsos e recorrentes" },
  devedores: { title: "Devedores", sub: "Consumo em crediário e quitações" },
  relatorios: { title: "Relatórios", sub: "Estrutura modular, pronta para expansão" },
  config: { title: "Configurações", sub: "Dados do estabelecimento e preferências" },
};

function hasPermission(staff, permKey) {
  return staff.is_owner || (staff.permissions || []).includes(permKey);
}

function Sidebar({ view, setView, open, staff }) {
  return (
    <div className={`bt-sidebar ${open ? "open" : ""}`}>
      <div className="bt-sidebar-brand">
        <div className="bt-logo-badge"><img src={BRAND.logo} alt={BRAND.name} /></div>
        <div>
          <div className="bt-brand-name">{BRAND.name}</div>
          <div className="bt-brand-tag">Painel administrativo</div>
        </div>
      </div>
      {NAV_GROUPS.map((group, gi) => {
        const items = group.items.filter((item) => hasPermission(staff, item.permKey));
        if (items.length === 0) return null;
        return (
          <div className="bt-nav-group" key={gi}>
            {group.label && <div className="bt-nav-group-label">{group.label.toUpperCase()}</div>}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`bt-nav-item ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)}>
                  <Icon />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="bt-sidebar-foot">Logado como {staff.name}{staff.is_owner ? " (dono)" : ""}</div>
    </div>
  );
}

function TopBar({ view, staff, onLogout, onMenu }) {
  const meta = VIEW_META[view];
  return (
    <div className="bt-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="bt-menu-btn" onClick={onMenu}><Menu size={17} /></button>
        <div>
          <div className="bt-topbar-title">{meta.title}</div>
          <div className="bt-topbar-sub">{meta.sub}</div>
        </div>
      </div>
      <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={onLogout}><LogOut size={14} /> Sair</button>
    </div>
  );
}

/* =========================================================================
   DASHBOARD — indicadores reais (clientes, agendamentos, ocupação, pico)
   ========================================================================= */
function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeCustomers: 0, bookingsThisMonth: 0, activeClubMembers: 0 });
  const [occSlots, setOccSlots] = useState([]);
  const [peakData, setPeakData] = useState([]);
  const [weekDemand, setWeekDemand] = useState([]);

  useEffect(() => {
    async function load() {
      const today = new Date();
      const [s, shifts, bookingsToday, monthRaw] = await Promise.all([
        fetchDashboardStats(),
        fetchShiftsForWeekday(today.getDay()),
        fetchBookingsForDate(today),
        fetchMonthBookingsRaw(),
      ]);
      setStats(s);

      const slots = buildSlotsFromShifts(shifts);
      const bookedHours = new Set(bookingsToday.map((b) => b.start_time.slice(0, 5)));
      setOccSlots(slots.map((s2) => ({ ...s2, busy: bookedHours.has(s2.hour) })));

      const peakMap = {};
      const weekdayMap = {};
      monthRaw.forEach((b) => {
        const hourLabel = `${b.start_time.slice(0, 2)}h`;
        peakMap[hourLabel] = (peakMap[hourLabel] || 0) + 1;
        const wd = new Date(`${b.booking_date}T00:00:00`).getDay();
        weekdayMap[wd] = (weekdayMap[wd] || 0) + 1;
      });
      setPeakData(Object.entries(peakMap).sort((a, b) => a[0].localeCompare(b[0])).map(([hour, reservas]) => ({ hour, reservas })));
      setWeekDemand(DAYS_OF_WEEK.map((d) => ({ dia: d.short, valor: weekdayMap[d.id] || 0 })));
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="bt-card-sub">Carregando indicadores...</div>;

  const busyCount = occSlots.filter((s) => s.busy).length;
  const occPct = occSlots.length ? Math.round((busyCount / occSlots.length) * 100) : 0;
  const maxWeek = Math.max(1, ...weekDemand.map((d) => d.valor));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="bt-stat-grid">
        <div className="bt-card"><div className="bt-stat-label">Clientes ativos</div><div className="bt-stat-value">{stats.activeCustomers}</div></div>
        <div className="bt-card"><div className="bt-stat-label">Agendamentos no mês</div><div className="bt-stat-value">{stats.bookingsThisMonth}</div></div>
        <div className="bt-card"><div className="bt-stat-label">Clube ativo</div><div className="bt-stat-value">{stats.activeClubMembers}</div></div>
        <div className="bt-card"><div className="bt-stat-label">Ocupação de hoje</div><div className="bt-stat-value">{occPct}%</div></div>
      </div>

      <div className="bt-card">
        <div className="bt-card-title">Ocupação de hoje por turno</div>
        {occSlots.length === 0 ? (
          <div className="bt-card-sub" style={{ marginTop: 8 }}>Fechado hoje — nenhum turno cadastrado para este dia da semana.</div>
        ) : (
          <>
            <div className="bt-occ-strip">{occSlots.map((s) => <div key={s.hour} className={`bt-occ-block ${s.busy ? "busy" : ""}`} />)}</div>
            <div className="bt-occ-labels">{occSlots.map((s) => <span key={s.hour}>{s.hour}</span>)}</div>
          </>
        )}
      </div>

      <div className="bt-grid-2">
        <div className="bt-card">
          <div className="bt-card-title">Horários de pico (mês atual)</div>
          <div style={{ height: 220, marginTop: 10 }}>
            {peakData.length === 0 ? (
              <div className="bt-card-sub">Ainda não há agendamentos suficientes este mês.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakData}>
                  <CartesianGrid vertical={false} stroke="#E4E1D8" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9CA3AE" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AE" }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#F5F3EE" }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="reservas" fill="#1F7A6C" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bt-card">
          <div className="bt-card-title">Dias com maior demanda (mês atual)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {weekDemand.map((d) => (
              <div key={d.dia} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, width: 30, color: "var(--ink-soft)" }}>{d.dia}</span>
                <div className="bt-bar-track"><div className="bt-bar-mini" style={{ width: `${(d.valor / maxWeek) * 100}%` }} /></div>
                <span style={{ fontSize: 11.5, color: "var(--ink-faint)", width: 18, textAlign: "right" }}>{d.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bt-card bt-stat-pending">
        <div className="bt-row">
          <div>
            <div className="bt-card-title">Receita</div>
            <div className="bt-card-sub">Faturamento, ticket médio e faturamento por produto aparecerão aqui assim que as regras de cobrança forem definidas.</div>
          </div>
          <span className="bt-badge bt-badge-muted">Aguardando definição</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   AGENDA — reservas reais de um dia escolhido
   ========================================================================= */
function AgendaView({ notify }) {
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const d = new Date(`${date}T00:00:00`);
    const [shifts, bookings] = await Promise.all([fetchShiftsForWeekday(d.getDay()), fetchBookingsForDate(d)]);
    const base = buildSlotsFromShifts(shifts);
    const byHour = {};
    bookings.forEach((b) => { byHour[b.start_time.slice(0, 5)] = b; });
    setSlots(base.map((s) => ({ ...s, booking: byHour[s.hour] || null })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  const shiftsOrder = [...new Set(slots.map((s) => s.shift))];

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      notify("Agendamento cancelado.");
      setSelected(null);
      load();
    } catch (e) {
      notify("Não foi possível cancelar: " + e.message);
    }
  };

  return (
    <div>
      <div className="bt-card">
        <div className="bt-row" style={{ marginBottom: 10 }}>
          <div>
            <div className="bt-card-title">Quadra 1</div>
            <div className="bt-card-sub">Funcionamento por turnos. Clique em um horário reservado para ver os detalhes.</div>
          </div>
          <input type="date" className="bt-input" style={{ maxWidth: 170 }} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {loading ? (
          <div className="bt-card-sub">Carregando agenda...</div>
        ) : slots.length === 0 ? (
          <div className="bt-card-sub">Fechado neste dia — nenhum turno cadastrado.</div>
        ) : (
          shiftsOrder.map((shiftName) => (
            <div key={shiftName} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>{shiftName}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {slots.filter((s) => s.shift === shiftName).map((s) => (
                  <div
                    key={s.hour}
                    onClick={() => s.booking && setSelected(s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "11px 10px",
                      borderBottom: "1px solid var(--border)", cursor: s.booking ? "pointer" : "default",
                      background: s.booking ? "var(--court-soft)" : "transparent", borderRadius: 8, flexWrap: "wrap",
                    }}
                  >
                    <div style={{ width: 54, fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>{s.hour}</div>
                    {s.booking ? (
                      <>
                        <span className="bt-badge bt-badge-court">{s.booking.booking_type === "clube" ? "Clube" : s.booking.booking_type === "plano" ? "Plano" : "Avulso"}</span>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.booking.customers?.name}</div>
                        <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{s.booking.products?.name}</div>
                      </>
                    ) : (
                      <span className="bt-badge bt-badge-muted">Disponível</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="bt-panel-overlay" onClick={() => setSelected(null)}>
          <div className="bt-panel" onClick={(e) => e.stopPropagation()}>
            <div className="bt-row" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setSelected(null)}>
                <ChevronLeft size={17} /> <span style={{ fontSize: 13, fontWeight: 700 }}>Fechar</span>
              </div>
            </div>
            <div className="bt-card-title" style={{ fontSize: 18 }}>{selected.hour} — Quadra 1</div>
            <div className="bt-field" style={{ marginTop: 18 }}>
              <div className="bt-label">Cliente</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.booking.customers?.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{selected.booking.customers?.phone}</div>
            </div>
            <div className="bt-field">
              <div className="bt-label">Produto / plano</div>
              <div style={{ fontSize: 14 }}>{selected.booking.products?.name}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="bt-btn bt-btn-ghost" style={{ flex: 1 }} onClick={() => openWhatsapp(selected.booking.customers?.phone)}><MessageCircle size={14} /> WhatsApp</button>
              <button className="bt-btn bt-btn-danger" style={{ flex: 1 }} onClick={() => handleCancel(selected.booking.id)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   RECORRÊNCIAS — cliente com horário fixo toda semana
   ========================================================================= */
function RecorrenciasView({ notify }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [phone, setPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [productId, setProductId] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("08:00");
  const [startDate, setStartDate] = useState(() => dateKey(new Date()));
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setList(await fetchRecurringBookings());
    setLoading(false);
  };
  useEffect(() => { load(); fetchProducts("court").then((all) => setProducts(all.filter((p) => p.status === "ativo"))); }, []);

  const lookupCustomer = async () => {
    if (!phone.trim()) return;
    const c = await findCustomerByPhone(phone);
    setFoundCustomer(c);
    if (!c) notify("Cliente não encontrado — cadastre primeiro em Clientes.");
  };

  const submit = async () => {
    if (!foundCustomer || !productId) { notify("Selecione um cliente e um produto."); return; }
    setSaving(true);
    try {
      const { generated, skipped } = await createRecurringBooking({
        customerId: foundCustomer.id, productId, weekday, startTime, startDate, endDate: endDate || null,
      });
      notify(`Recorrência criada — ${generated} agendamentos gerados${skipped ? `, ${skipped} pulados por já estarem ocupados` : ""}.`);
      setShowForm(false); setPhone(""); setFoundCustomer(null); setProductId(""); setEndDate("");
      load();
    } catch (e) {
      notify("Erro ao criar recorrência: " + e.message);
    }
    setSaving(false);
  };

  const cancel = async (r) => {
    await cancelRecurringBooking(r.id);
    notify("Recorrência cancelada — os agendamentos futuros dela também foram cancelados.");
    load();
  };

  return (
    <div>
      <div className="bt-row" style={{ marginBottom: 16 }}>
        <div className="bt-card-sub">Clientes que jogam no mesmo dia e horário toda semana. Gera os próximos {8} agendamentos automaticamente.</div>
        <button className="bt-btn bt-btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Nova recorrência</button>
      </div>

      {showForm && (
        <div className="bt-card" style={{ background: "var(--surface-alt)", marginBottom: 16 }}>
          <div className="bt-field">
            <div className="bt-label">Telefone do cliente</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="bt-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={lookupCustomer}>Buscar</button>
            </div>
            {foundCustomer && <div style={{ fontSize: 12.5, color: "var(--court)", marginTop: 6 }}>Cliente: {foundCustomer.name}</div>}
          </div>
          <div className="bt-grid-2">
            <div className="bt-field">
              <div className="bt-label">Produto / plano</div>
              <select className="bt-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Selecione...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="bt-field">
              <div className="bt-label">Dia da semana</div>
              <select className="bt-select" value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                {DAYS_OF_WEEK.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
          </div>
          <div className="bt-grid-2">
            <div className="bt-field"><div className="bt-label">Horário</div><input type="time" className="bt-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
            <div className="bt-field"><div className="bt-label">Começa em</div><input type="date" className="bt-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          </div>
          <div className="bt-field" style={{ maxWidth: 220 }}>
            <div className="bt-label">Termina em (opcional)</div>
            <input type="date" className="bt-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="bt-btn bt-btn-primary bt-btn-sm" disabled={saving} onClick={submit}>{saving ? "Criando..." : "Criar recorrência"}</button>
          </div>
        </div>
      )}

      <div className="bt-card" style={{ padding: 0 }}>
        {loading ? <div className="bt-card-sub" style={{ padding: 16 }}>Carregando...</div> : list.length === 0 ? (
          <div className="bt-card-sub" style={{ padding: 16 }}>Nenhuma recorrência cadastrada ainda.</div>
        ) : (
          <table className="bt-table">
            <thead><tr><th>Cliente</th><th>Dia</th><th>Horário</th><th>Produto</th><th>Período</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.customers?.name}</td>
                  <td>{DAYS_OF_WEEK.find((d) => d.id === r.weekday)?.label}</td>
                  <td>{r.start_time.slice(0, 5)}</td>
                  <td>{r.products?.name}</td>
                  <td style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                    {new Date(`${r.start_date}T00:00:00`).toLocaleDateString("pt-BR")} até {r.end_date ? new Date(`${r.end_date}T00:00:00`).toLocaleDateString("pt-BR") : "indefinido"}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ textAlign: "right" }}>
                    {r.status === "ativo" && <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => cancel(r)}>Cancelar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   CLIENTES / CRM — dados reais
   ========================================================================= */
function NovoClienteModal({ onClose, notify, onCreated }) {
  const [showMore, setShowMore] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!nome.trim() || !telefone.trim()) { notify("Nome e telefone são obrigatórios."); return; }
    setSaving(true);
    try {
      await createCustomer({ name: nome, phone: telefone, cpf, birthdate: nascimento || null });
      notify("Cliente cadastrado.");
      onCreated();
      onClose();
    } catch (e) {
      notify("Erro ao cadastrar: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="bt-panel-overlay" onClick={onClose}>
      <div className="bt-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 18 }} onClick={onClose}>
          <ChevronLeft size={17} /> <span style={{ fontSize: 13, fontWeight: 700 }}>Fechar</span>
        </div>
        <div className="bt-card-title" style={{ fontSize: 19, marginBottom: 18 }}>Novo cliente</div>
        <div className="bt-field"><div className="bt-label">Nome *</div><input className="bt-input" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
        <div className="bt-field"><div className="bt-label">Telefone *</div><input className="bt-input" value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-deep)", cursor: "pointer", marginBottom: showMore ? 14 : 4 }} onClick={() => setShowMore((s) => !s)}>
          {showMore ? "− Ocultar dados adicionais" : "+ Preencher mais dados (opcional)"}
        </div>
        {showMore && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="bt-field"><div className="bt-label">CPF</div><input className="bt-input" value={cpf} onChange={(e) => setCpf(e.target.value)} /></div>
            <div className="bt-field"><div className="bt-label">Data de nascimento</div><input type="date" className="bt-input" value={nascimento} onChange={(e) => setNascimento(e.target.value)} /></div>
          </div>
        )}
        <button className="bt-btn bt-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={saving} onClick={submit}>
          {saving ? "Salvando..." : "Salvar cliente"}
        </button>
      </div>
    </div>
  );
}

function ClientDetail({ client, onBack, notify }) {
  const [tab, setTab] = useState("quadra");
  const [bookings, setBookings] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(client.status);

  const load = async () => {
    setLoading(true);
    const [b, c] = await Promise.all([fetchCustomerBookings(client.id), fetchClubMembership(client.id)]);
    setBookings(b);
    setClub(c);
    setLoading(false);
  };
  useEffect(() => { load(); }, [client.id]);

  const toggleStatus = async () => {
    const next = status === "ativo" ? "inativo" : "ativo";
    await setCustomerStatus(client.id, next);
    setStatus(next);
    notify(next === "inativo" ? "Cliente inativado — histórico preservado." : "Cliente reativado.");
  };

  const ativarClube = async () => {
    await activateClub(client.id);
    notify("Clube mensal ativado para este cliente.");
    load();
  };
  const lancarPagamento = async () => {
    await payClubMembership(club.id);
    notify("Pagamento da mensalidade registrado.");
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 18 }} onClick={onBack}>
        <ChevronLeft size={17} /> <span style={{ fontSize: 13, fontWeight: 700 }}>Voltar para clientes</span>
      </div>

      <div className="bt-card" style={{ marginBottom: 16 }}>
        <div className="bt-row">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="bt-avatar" style={{ width: 50, height: 50, fontSize: 16 }}>{initials(client.name)}</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>{client.name}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{client.phone}</div>
            </div>
            <StatusBadge status={status} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => openWhatsapp(client.phone)}><MessageCircle size={14} /> WhatsApp</button>
            <button className="bt-btn bt-btn-danger bt-btn-sm" onClick={toggleStatus}>{status === "ativo" ? "Inativar" : "Reativar"}</button>
          </div>
        </div>
      </div>

      <div className="bt-card" style={{ marginBottom: 16 }}>
        <div className="bt-row">
          <div>
            <div className="bt-card-title">Clube mensal</div>
            <div className="bt-card-sub">Mensalidade paga libera agendamentos sem cobrança avulsa a cada reserva.</div>
          </div>
          {club ? <span className={`bt-badge ${club.status === "ativo" ? "bt-badge-success" : "bt-badge-muted"}`}>{club.status === "ativo" ? "Ativo" : "Inativo"}</span> : <span className="bt-badge bt-badge-muted">Não participa</span>}
        </div>
        {loading ? null : club ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13.5, marginBottom: 14 }}>
              <div><div className="bt-stat-label">Referência</div><div style={{ fontWeight: 700 }}>{new Date(`${club.reference_month}T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div></div>
              <div><div className="bt-stat-label">Mensalidade</div><div style={{ fontWeight: 700 }}>{formatBRL(club.monthly_fee)}</div></div>
              <div><div className="bt-stat-label">Status do período</div><span className={`bt-badge ${club.paid ? "bt-badge-success" : "bt-badge-warning"}`}>{club.paid ? "Paga" : "Pendente"}</span></div>
            </div>
            {!club.paid && <button className="bt-btn bt-btn-primary bt-btn-sm" onClick={lancarPagamento}>Lançar pagamento da mensalidade</button>}
          </div>
        ) : (
          <button className="bt-btn bt-btn-ghost bt-btn-sm" style={{ marginTop: 10 }} onClick={ativarClube}>Ativar clube mensal para este cliente</button>
        )}
      </div>

      <div className="bt-card">
        <div className="bt-tabs">
          <div className={`bt-tab ${tab === "quadra" ? "active" : ""}`} onClick={() => setTab("quadra")}>Histórico de quadra</div>
          <div className={`bt-tab ${tab === "bar" ? "active" : ""}`} onClick={() => setTab("bar")}>Histórico no bar</div>
          <div className={`bt-tab ${tab === "dados" ? "active" : ""}`} onClick={() => setTab("dados")}>Dados cadastrais</div>
        </div>

        {tab === "quadra" && (
          loading ? <div className="bt-card-sub">Carregando...</div> : bookings.length === 0 ? <div className="bt-card-sub">Nenhum agendamento ainda.</div> : (
            <table className="bt-table">
              <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{new Date(`${b.booking_date}T00:00:00`).toLocaleDateString("pt-BR")} {b.start_time.slice(0, 5)}</td>
                    <td>{b.products?.name}</td>
                    <td><span className="bt-badge bt-badge-muted">{b.booking_type}</span></td>
                    <td><StatusBadge status={b.status === "confirmado" ? "ativo" : "inativo"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
        {tab === "bar" && <div className="bt-card-sub">Módulo de mesas/comandas ainda não conectado ao banco de dados.</div>}
        {tab === "dados" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13.5 }}>
            <div className="bt-row"><span style={{ color: "var(--ink-soft)" }}>Nome</span><span style={{ fontWeight: 600 }}>{client.name}</span></div>
            <div className="bt-row"><span style={{ color: "var(--ink-soft)" }}>Telefone</span><span style={{ fontWeight: 600 }}>{client.phone}</span></div>
            <div className="bt-row"><span style={{ color: "var(--ink-soft)" }}>CPF</span><span style={{ fontWeight: 600 }}>{client.cpf || "Não informado"}</span></div>
            <div className="bt-row"><span style={{ color: "var(--ink-soft)" }}>Data de nascimento</span><span style={{ fontWeight: 600 }}>{client.birthdate || "Não informado"}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientesView({ notify }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ativo");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await searchCustomers(q, filter);
    setCustomers(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [q, filter]);

  if (selected) return <ClientDetail client={selected} onBack={() => { setSelected(null); load(); }} notify={notify} />;

  return (
    <div>
      <div className="bt-row" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["ativo", "Ativos"], ["inativo", "Inativos"], ["todos", "Todos"]].map(([k, l]) => (
            <div key={k} className={`bt-chip ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{l}</div>
          ))}
        </div>
        <button className="bt-btn bt-btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> Novo cliente</button>
      </div>
      <div className="bt-field" style={{ maxWidth: 340 }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--ink-faint)" }} />
          <input className="bt-input" style={{ paddingLeft: 32 }} placeholder="Buscar por nome, telefone ou CPF..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="bt-card" style={{ padding: 0 }}>
        {loading ? <div className="bt-card-sub" style={{ padding: 16 }}>Carregando...</div> : (
          <table className="bt-table">
            <thead><tr><th>Cliente</th><th>Telefone</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                  <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="bt-avatar">{initials(c.name)}</div>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                  </td>
                  <td>{c.phone}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => openWhatsapp(c.phone)}><Phone size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showNew && <NovoClienteModal onClose={() => setShowNew(false)} notify={notify} onCreated={load} />}
    </div>
  );
}

/* =========================================================================
   PRODUTOS (QUADRA E BAR) — CRUD real, mesma tabela, tipos diferentes
   ========================================================================= */
function ProductsCrud({ productType, notify, showCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Bebidas", image_url: "", show_in_menu: true });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const load = async () => {
    setLoading(true);
    setProducts(await fetchProducts(productType));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditingId(null); setForm({ name: "", description: "", price: "", category: "Bebidas", image_url: "", show_in_menu: true }); setImageFile(null); setShowForm(true); };
  const startEdit = (p) => { setEditingId(p.id); setForm({ name: p.name, description: p.description || "", price: p.price, category: p.category || "Bebidas", image_url: p.image_url || "", show_in_menu: p.show_in_menu !== false }); setImageFile(null); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim() || !form.price) { notify("Nome e preço são obrigatórios."); return; }
    let imageUrl = form.image_url;
    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadProductImage(imageFile);
      } catch (e) {
        notify("Erro ao enviar imagem: " + e.message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    const payload = { product_type: productType, name: form.name, description: form.description, price: Number(form.price), image_url: imageUrl || null };
    if (showCategory) { payload.category = form.category; payload.show_in_menu = form.show_in_menu; }
    try {
      if (editingId) await updateProduct(editingId, payload);
      else await createProduct(payload);
      notify("Produto salvo.");
      setShowForm(false);
      load();
    } catch (e) {
      notify("Erro ao salvar: " + e.message);
    }
  };

  const toggle = async (p) => {
    await toggleProductStatus(p.id, p.status);
    load();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) setImageFile(file);
  };

  return (
    <div className="bt-card">
      <div className="bt-row" style={{ marginBottom: 16 }}>
        <div className="bt-card-title">{productType === "court" ? "Planos / Produtos da Quadra" : "Produtos do Bar"}</div>
        <button className="bt-btn bt-btn-primary" onClick={startCreate}><Plus size={15} /> Novo produto</button>
      </div>

      {showForm && (
        <div className="bt-card" style={{ background: "var(--surface-alt)", marginBottom: 16 }}>
          <div className="bt-grid-2" style={{ marginBottom: 10 }}>
            <div className="bt-field"><div className="bt-label">Nome</div><input className="bt-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="bt-field"><div className="bt-label">Preço</div><input type="number" step="0.01" className="bt-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div className="bt-field"><div className="bt-label">Descrição</div><input className="bt-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          {showCategory && (
            <div className="bt-field" style={{ maxWidth: 220 }}>
              <div className="bt-label">Categoria</div>
              <select className="bt-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["Bebidas", "Comidas", "Porções", "Lanches", "Sobremesas", "Outros"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {showCategory && (
            <label className="bt-row" style={{ fontSize: 13, marginBottom: 14 }}>
              <span>Mostrar no cardápio público (além do painel de mesas)</span>
              <input type="checkbox" checked={form.show_in_menu} onChange={(e) => setForm({ ...form, show_in_menu: e.target.checked })} />
            </label>
          )}
          <div className="bt-field">
            <div className="bt-label">Foto</div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10,
                border: `1.5px dashed ${dragging ? "var(--brand)" : "var(--border)"}`,
                background: dragging ? "var(--warning-soft)" : "transparent",
              }}
            >
              {(imageFile || form.image_url) ? (
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} alt="" className="bt-photo-thumb" />
              ) : (
                <div className="bt-photo-thumb" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 6 }}>Arraste uma imagem aqui, ou:</div>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="bt-btn bt-btn-primary bt-btn-sm" disabled={uploading} onClick={save}>{uploading ? "Enviando foto..." : "Salvar"}</button>
          </div>
        </div>
      )}

      {loading ? <div className="bt-card-sub">Carregando...</div> : (
        <table className="bt-table">
          <thead><tr><th></th><th>Nome</th><th>Descrição</th>{showCategory && <th>Categoria</th>}{showCategory && <th>Cardápio</th>}<th>Preço</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.image_url ? <img src={p.image_url} alt="" className="bt-photo-thumb" /> : <div className="bt-photo-thumb" />}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ color: "var(--ink-soft)" }}>{p.description}</td>
                {showCategory && <td><span className="bt-badge bt-badge-muted">{p.category}</span></td>}
                {showCategory && <td>{p.show_in_menu !== false ? <span className="bt-badge bt-badge-success">Cardápio + Mesas</span> : <span className="bt-badge bt-badge-muted">Só Mesas</span>}</td>}
                <td>{formatBRL(p.price)}</td>
                <td><StatusBadge status={p.status} /></td>
                <td style={{ textAlign: "right" }}>
                  <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => startEdit(p)}>Editar</button>{" "}
                  <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => toggle(p)}>{p.status === "ativo" ? "Inativar" : "Reativar"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* =========================================================================
   MESAS / COMANDAS — reais, com abertura, lançamento de itens e fechamento
   ========================================================================= */
function AbrirMesaPanel({ table, onClose, notify, onOpened }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [pessoas, setPessoas] = useState(1);
  const [saving, setSaving] = useState(false);

  const lookupPhone = async () => {
    if (!telefone.trim()) return;
    const c = await findCustomerByPhone(telefone);
    setFoundCustomer(c);
    if (c) setNome(c.name);
  };

  const submit = async () => {
    setSaving(true);
    try {
      await openTableSession({
        tableId: table.id,
        tableNumber: table.number,
        customerId: foundCustomer?.id || null,
        customerName: nome || null,
        customerPhone: telefone || null,
        peopleCount: pessoas,
      });
      notify(`Mesa ${table.number} aberta.`);
      onOpened();
      onClose();
    } catch (e) {
      notify(e.message);
      onOpened(); // atualiza a grade — se foi corrida, a mesa já aparece ocupada
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="bt-panel-overlay" onClick={onClose}>
      <div className="bt-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 18 }} onClick={onClose}>
          <ChevronLeft size={17} /> <span style={{ fontSize: 13, fontWeight: 700 }}>Fechar</span>
        </div>
        <div className="bt-card-title" style={{ fontSize: 19, marginBottom: 4 }}>Abrir Mesa {String(table.number).padStart(2, "0")}</div>
        <div className="bt-card-sub" style={{ marginBottom: 18 }}>Nome e telefone são opcionais.</div>

        <div className="bt-field">
          <div className="bt-label">Telefone (opcional)</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="bt-input" value={telefone} onChange={(e) => { setTelefone(e.target.value); setFoundCustomer(null); }} onBlur={lookupPhone} />
          </div>
          {foundCustomer && <div style={{ fontSize: 12.5, color: "var(--court)", marginTop: 6 }}>Cliente encontrado: {foundCustomer.name}</div>}
        </div>
        <div className="bt-field"><div className="bt-label">Nome (opcional)</div><input className="bt-input" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
        <div className="bt-field"><div className="bt-label">Quantidade de pessoas</div><input type="number" min={1} className="bt-input" value={pessoas} onChange={(e) => setPessoas(Number(e.target.value) || 1)} /></div>

        <button className="bt-btn bt-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={saving} onClick={submit}>
          {saving ? "Abrindo..." : "Abrir mesa e lançar produtos"}
        </button>
      </div>
    </div>
  );
}

function ComandaPanel({ table, notify, onClose, onClosed }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addProductId, setAddProductId] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [serviceOn, setServiceOn] = useState(true);
  const [couvertOn, setCouvertOn] = useState(false);
  const [couvertValue, setCouvertValue] = useState(10);
  const [pessoas, setPessoas] = useState(table.session.people_count || 1);
  const [confirming, setConfirming] = useState(false);
  const [payments, setPayments] = useState([]);
  const [payerName, setPayerName] = useState("");
  const [payerAmount, setPayerAmount] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [creditPhone, setCreditPhone] = useState("");
  const [creditCustomer, setCreditCustomer] = useState(null);

  const load = async () => {
    setLoading(true);
    setItems(await fetchSessionItems(table.session.id));
    setLoading(false);
  };
  const loadPayments = async () => setPayments(await fetchSessionPayments(table.session.id));
  useEffect(() => { load(); loadPayments(); fetchProducts("bar").then((all) => setProducts(all.filter((p) => p.status === "ativo"))); }, []);

  const subtotal = items.reduce((s, it) => s + it.quantity * Number(it.unit_price), 0);
  const serviceValue = serviceOn ? subtotal * 0.1 : 0;
  const couvertTotal = couvertOn ? pessoas * couvertValue : 0;
  const total = subtotal + serviceValue + couvertTotal;
  const paidSoFar = payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.max(0, total - paidSoFar);

  const addItem = async () => {
    if (!addProductId) return;
    const product = products.find((p) => p.id === addProductId);
    await addOrderItem({ sessionId: table.session.id, productId: addProductId, quantity: addQty, unitPrice: product.price, productName: product.name });
    setAddProductId(""); setAddQty(1);
    load();
  };
  const changeQty = async (item, delta) => {
    const next = Math.max(1, item.quantity + delta);
    await updateOrderItemQuantity(item.id, next);
    load();
  };
  const removeItem = async (item) => {
    await removeOrderItem(item.id);
    load();
  };

  const lookupCreditCustomer = async () => {
    if (!creditPhone.trim()) return;
    const c = await findCustomerByPhone(creditPhone);
    setCreditCustomer(c);
    if (!c) notify("Cliente não encontrado — para fiar, o cliente precisa estar cadastrado no CRM.");
  };

  const addPayment = async () => {
    const amt = Number(payerAmount);
    if (!amt || amt <= 0) { notify("Informe um valor válido."); return; }
    if (isCredit && !creditCustomer) { notify("Busque e confirme o cliente pelo telefone para lançar no crediário."); return; }
    try {
      await addSessionPayment({
        sessionId: table.session.id,
        payerName: isCredit ? creditCustomer.name : payerName,
        amount: amt,
        isCredit,
        customerId: isCredit ? creditCustomer.id : null,
        tableNumber: table.number,
      });
      setPayerName(""); setPayerAmount(""); setIsCredit(false); setCreditPhone(""); setCreditCustomer(null);
      loadPayments();
    } catch (e) {
      notify("Erro ao lançar pagamento: " + e.message);
    }
  };
  const removePayment = async (id) => { await removeSessionPayment(id); loadPayments(); };

  const confirmClose = async () => {
    try {
      await closeTableSession(table.session.id, {
        tableNumber: table.number,
        serviceChargeEnabled: serviceOn, coverChargeEnabled: couvertOn, coverChargePerPerson: couvertOn ? couvertValue : 0,
        subtotal, total, splitCount: payments.length,
      });
      notify(`Mesa ${table.number} fechada — consumo registrado.`);
      onClosed();
      onClose();
    } catch (e) {
      notify(e.message);
      onClosed(); // atualiza a grade — se foi corrida, a mesa já aparece livre
      onClose();
    }
  };

  const customerName = table.session.customers?.name || table.session.customer_name_snapshot;
  const customerPhone = table.session.customers?.phone || table.session.customer_phone_snapshot;

  return (
    <div className="bt-panel-overlay" onClick={onClose}>
      <div className="bt-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 16 }} onClick={onClose}>
          <ChevronLeft size={17} /> <span style={{ fontSize: 13, fontWeight: 700 }}>Fechar</span>
        </div>
        <div className="bt-card-title" style={{ fontSize: 19 }}>Mesa {String(table.number).padStart(2, "0")}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, marginBottom: 18 }}>
          <div>
            <div className="bt-label">Cliente</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{customerName || "Não identificado"}</div>
            {customerPhone && <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{customerPhone}</div>}
          </div>
          {customerPhone && <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => openWhatsapp(customerPhone)}><MessageCircle size={14} /> WhatsApp</button>}
        </div>

        {!confirming ? (
          <>
            <div className="bt-row" style={{ marginBottom: 8 }}>
              <div className="bt-card-title" style={{ fontSize: 13 }}>Itens da comanda</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <select className="bt-select" value={addProductId} onChange={(e) => setAddProductId(e.target.value)}>
                <option value="">Adicionar produto...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatBRL(p.price)}</option>)}
              </select>
              <input type="number" min={1} className="bt-input" style={{ width: 60 }} value={addQty} onChange={(e) => setAddQty(Number(e.target.value) || 1)} />
              <button className="bt-btn bt-btn-primary bt-btn-sm" onClick={addItem}><Plus size={13} /></button>
            </div>

            {loading ? <div className="bt-card-sub">Carregando...</div> : items.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--ink-soft)", padding: "10px 0" }}>Nenhum item lançado ainda.</div>
            ) : items.map((it) => (
              <div className="bt-item-row" key={it.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it.products?.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{formatBRL(it.unit_price)} / un.</div>
                </div>
                <button className="bt-qty-btn" onClick={() => changeQty(it, -1)}><Minus size={12} /></button>
                <span style={{ width: 18, textAlign: "center", fontWeight: 700 }}>{it.quantity}</span>
                <button className="bt-qty-btn" onClick={() => changeQty(it, 1)}><Plus size={12} /></button>
                <div style={{ width: 62, textAlign: "right", fontWeight: 700 }}>{formatBRL(it.quantity * it.unit_price)}</div>
                <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => removeItem(it)}>×</button>
              </div>
            ))}

            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <label className="bt-row" style={{ fontSize: 13 }}>
                <span>Adicionar 10% de serviço</span>
                <input type="checkbox" checked={serviceOn} onChange={(e) => setServiceOn(e.target.checked)} />
              </label>
              <label className="bt-row" style={{ fontSize: 13 }}>
                <span>Cobrar couvert</span>
                <input type="checkbox" checked={couvertOn} onChange={(e) => setCouvertOn(e.target.checked)} />
              </label>
              {couvertOn && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}><div className="bt-label">Pessoas</div><input type="number" min={1} className="bt-input" value={pessoas} onChange={(e) => setPessoas(Number(e.target.value) || 1)} /></div>
                  <div style={{ flex: 1 }}><div className="bt-label">Valor / pessoa</div><input type="number" min={0} className="bt-input" value={couvertValue} onChange={(e) => setCouvertValue(Number(e.target.value) || 0)} /></div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5 }}>
              <div className="bt-row"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
              {serviceOn && <div className="bt-row"><span>Serviço 10%</span><span>{formatBRL(serviceValue)}</span></div>}
              {couvertOn && <div className="bt-row"><span>Couvert ({pessoas} pessoas)</span><span>{formatBRL(couvertTotal)}</span></div>}
              <div className="bt-row" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, marginTop: 4 }}>
                <span>Total</span><span>{formatBRL(total)}</span>
              </div>
            </div>

            <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div className="bt-card-title" style={{ fontSize: 13, marginBottom: 8 }}>Dividir conta (opcional)</div>
              {payments.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  {payments.map((p) => (
                    <div className="bt-item-row" key={p.id}>
                      <div style={{ flex: 1 }}>{p.payer_name || "Sem nome"}{p.is_credit && <span className="bt-badge bt-badge-warning" style={{ marginLeft: 6 }}>Crediário</span>}</div>
                      <div style={{ fontWeight: 700 }}>{formatBRL(p.amount)}</div>
                      <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => removePayment(p.id)}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                {!isCredit && <input className="bt-input" placeholder="Nome (opcional)" value={payerName} onChange={(e) => setPayerName(e.target.value)} />}
                {isCredit && (
                  <div style={{ flex: 1, display: "flex", gap: 6 }}>
                    <input className="bt-input" placeholder="Telefone do cliente" value={creditPhone} onChange={(e) => { setCreditPhone(e.target.value); setCreditCustomer(null); }} onBlur={lookupCreditCustomer} />
                  </div>
                )}
                <input type="number" min={0} step="0.01" className="bt-input" style={{ width: 100 }} placeholder="Valor" value={payerAmount} onChange={(e) => setPayerAmount(e.target.value)} />
                <button className="bt-btn bt-btn-primary bt-btn-sm" onClick={addPayment}><Plus size={13} /></button>
              </div>
              <label className="bt-row" style={{ fontSize: 12.5, marginTop: 6 }}>
                <span>Lançar como crediário (fiado)</span>
                <input type="checkbox" checked={isCredit} onChange={(e) => { setIsCredit(e.target.checked); setPayerName(""); }} />
              </label>
              {isCredit && creditCustomer && <div style={{ fontSize: 12, color: "var(--court)", marginTop: 4 }}>Cliente: {creditCustomer.name}</div>}
              {payments.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  <div className="bt-row"><span>Recebido até agora</span><span style={{ fontWeight: 700 }}>{formatBRL(paidSoFar)}</span></div>
                  <div className="bt-row">
                    <span>Falta receber</span>
                    <span style={{ fontWeight: 700, color: remaining > 0.009 ? "var(--danger)" : "var(--success)" }}>{formatBRL(remaining)}</span>
                  </div>
                </div>
              )}
            </div>

            <button className="bt-btn bt-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 20 }} onClick={() => setConfirming(true)}>Fechar mesa</button>
          </>
        ) : (
          <div>
            <div className="bt-card" style={{ background: "var(--surface-alt)" }}>
              <div className="bt-card-title" style={{ marginBottom: 10 }}>Resumo do fechamento</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5 }}>
                <div className="bt-row"><span>Produtos</span><span>{formatBRL(subtotal)}</span></div>
                {serviceOn && <div className="bt-row"><span>Serviço 10%</span><span>{formatBRL(serviceValue)}</span></div>}
                {couvertOn && <div className="bt-row"><span>Couvert</span><span>{formatBRL(couvertTotal)}</span></div>}
                <div className="bt-row" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, marginTop: 6, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  <span>Total</span><span>{formatBRL(total)}</span>
                </div>
              </div>
              {payments.length > 0 && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>Dividido em {payments.length} pagamento{payments.length > 1 ? "s" : ""}:</div>
                  {payments.map((p) => (
                    <div key={p.id} className="bt-row" style={{ fontSize: 13 }}><span>{p.payer_name || "Sem nome"}</span><span>{formatBRL(p.amount)}</span></div>
                  ))}
                  {remaining > 0.009 && <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6 }}>Ainda falta {formatBRL(remaining)} — vai fechar mesmo assim?</div>}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="bt-btn bt-btn-ghost" style={{ flex: 1 }} onClick={() => setConfirming(false)}>Voltar</button>
              <button className="bt-btn bt-btn-primary" style={{ flex: 1 }} onClick={confirmClose}>Confirmar fechamento</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MesasView({ notify }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    setTables(await fetchTablesWithStatus());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      {loading ? <div className="bt-card-sub">Carregando mesas...</div> : (
        <div className="bt-tables-grid">
          {tables.map((t) => (
            <div key={t.id} className={`bt-table-card ${t.session ? "st-ocupada" : ""}`} onClick={() => setSelected(t)}>
              <div className="bt-table-num">Mesa {String(t.number).padStart(2, "0")}</div>
              {t.session ? (
                <div style={{ marginTop: 6 }}>
                  <span className="bt-badge bt-badge-warning">Ocupada</span>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>{t.session.customers?.name || t.session.customer_name_snapshot || "Não identificado"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{t.session.people_count} pessoas</div>
                </div>
              ) : <span className="bt-badge bt-badge-muted">Livre</span>}
            </div>
          ))}
        </div>
      )}
      {selected && !selected.session && <AbrirMesaPanel table={selected} onClose={() => setSelected(null)} notify={notify} onOpened={load} />}
      {selected && selected.session && <ComandaPanel table={selected} onClose={() => setSelected(null)} notify={notify} onClosed={load} />}
    </div>
  );
}

/* =========================================================================
   VENDAS — reais, contra as tabelas sales / sale_items
   ========================================================================= */
function VendasView({ notify }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [phone, setPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saleType, setSaleType] = useState("avulso");

  const load = async () => {
    setLoading(true);
    setSales(await fetchSales());
    setLoading(false);
  };
  useEffect(() => { load(); fetchAllActiveProducts().then(setProducts); }, []);

  const lookupCustomer = async () => {
    if (!phone.trim()) return;
    const results = await searchCustomers(phone, "todos");
    setFoundCustomer(results[0] || null);
    if (!results[0]) notify("Cliente não encontrado — cadastre primeiro em Clientes.");
  };

  const submitSale = async () => {
    if (!foundCustomer || !productId) { notify("Selecione um cliente e um produto."); return; }
    const product = products.find((p) => p.id === productId);
    try {
      await createSale({ customerId: foundCustomer.id, productId, quantity, unitPrice: product.price, saleType, productName: product.name });
      notify("Venda registrada.");
      setShowForm(false); setPhone(""); setFoundCustomer(null); setProductId(""); setQuantity(1);
      load();
    } catch (e) {
      notify("Erro ao registrar venda: " + e.message);
    }
  };

  return (
    <div>
      <div className="bt-row" style={{ marginBottom: 16 }}>
        <div className="bt-card-sub">Lançamentos avulsos e recorrentes de planos, pacotes e produtos.</div>
        <button className="bt-btn bt-btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Nova venda</button>
      </div>

      {showForm && (
        <div className="bt-card" style={{ background: "var(--surface-alt)", marginBottom: 16 }}>
          <div className="bt-field">
            <div className="bt-label">Telefone do cliente</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="bt-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={lookupCustomer}>Buscar</button>
            </div>
            {foundCustomer && <div style={{ fontSize: 12.5, color: "var(--court)", marginTop: 6 }}>Cliente: {foundCustomer.name}</div>}
          </div>
          <div className="bt-grid-2">
            <div className="bt-field">
              <div className="bt-label">Produto</div>
              <select className="bt-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Selecione...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatBRL(p.price)}</option>)}
              </select>
            </div>
            <div className="bt-field">
              <div className="bt-label">Quantidade</div>
              <input type="number" min={1} className="bt-input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
            </div>
          </div>
          <div className="bt-field" style={{ maxWidth: 220 }}>
            <div className="bt-label">Tipo</div>
            <select className="bt-select" value={saleType} onChange={(e) => setSaleType(e.target.value)}>
              <option value="avulso">Avulso</option>
              <option value="recorrente">Recorrente</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="bt-btn bt-btn-primary bt-btn-sm" onClick={submitSale}>Registrar venda</button>
          </div>
        </div>
      )}

      <div className="bt-card" style={{ padding: 0 }}>
        {loading ? <div className="bt-card-sub" style={{ padding: 16 }}>Carregando...</div> : (
          <table className="bt-table">
            <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Valor</th><th>Tipo</th></tr></thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(`${s.sale_date}T00:00:00`).toLocaleDateString("pt-BR")}</td>
                  <td style={{ fontWeight: 600 }}>{s.customers?.name || "—"}</td>
                  <td>{s.sale_items?.[0]?.products?.name}</td>
                  <td>{formatBRL(s.total)}</td>
                  <td><span className={`bt-badge ${s.sale_type === "recorrente" ? "bt-badge-court" : "bt-badge-muted"}`}>{s.sale_type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   DEVEDORES — consumo em crediário (fiado) e quitação
   ========================================================================= */
function DevedoresView({ notify }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setDebts(await fetchDebts());
      setError("");
    } catch (e) {
      setError("Você não tem permissão para ver esta área, ou houve um erro: " + e.message);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const baixar = async (d) => {
    await settleDebt(d.id);
    notify(`Baixa registrada — ${d.customers?.name}.`);
    load();
  };

  const byCustomer = {};
  debts.filter((d) => d.status === "pendente").forEach((d) => {
    const key = d.customer_id;
    if (!byCustomer[key]) byCustomer[key] = { name: d.customers?.name, phone: d.customers?.phone, total: 0, items: [] };
    byCustomer[key].total += Number(d.amount);
    byCustomer[key].items.push(d);
  });
  const groups = Object.values(byCustomer).sort((a, b) => b.total - a.total);
  const paidDebts = debts.filter((d) => d.status === "pago");

  if (error) return <div className="bt-card"><div className="bt-card-sub">{error}</div></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="bt-card">
        <div className="bt-card-title" style={{ marginBottom: 4 }}>Em aberto</div>
        <div className="bt-card-sub" style={{ marginBottom: 14 }}>Consumo lançado como crediário nas mesas, ainda não quitado.</div>
        {loading ? <div className="bt-card-sub">Carregando...</div> : groups.length === 0 ? (
          <div className="bt-card-sub">Ninguém devendo no momento.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {groups.map((g) => (
              <div key={g.name} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                <div className="bt-row" style={{ marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{g.phone}</div>
                  </div>
                  <span className="bt-badge bt-badge-warning">Deve {formatBRL(g.total)}</span>
                </div>
                {g.items.map((d) => (
                  <div key={d.id} className="bt-item-row">
                    <div style={{ flex: 1 }}>
                      <div>{d.description}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{new Date(d.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatBRL(d.amount)}</div>
                    <button className="bt-btn bt-btn-primary bt-btn-sm" onClick={() => baixar(d)}>Dar baixa</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {paidDebts.length > 0 && (
        <div className="bt-card">
          <div className="bt-card-title" style={{ marginBottom: 10 }}>Quitados recentemente</div>
          <table className="bt-table">
            <thead><tr><th>Cliente</th><th>Valor</th><th>Quitado em</th></tr></thead>
            <tbody>
              {paidDebts.slice(0, 20).map((d) => (
                <tr key={d.id}>
                  <td>{d.customers?.name}</td>
                  <td>{formatBRL(d.amount)}</td>
                  <td>{new Date(d.paid_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   RELATÓRIOS — estrutura modular (proposital, sem regras ainda definidas)
   ========================================================================= */
function formatLogDetails(details) {
  if (!details || typeof details !== "object") return "";
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join(" · ");
}

function HistoricoAlteracoes({ notify }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then(setLogs).catch((e) => notify("Erro ao carregar histórico: " + e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bt-card">
      <div className="bt-card-title" style={{ marginBottom: 4 }}>Histórico de alterações</div>
      <div className="bt-card-sub" style={{ marginBottom: 14 }}>Registro simples de tudo que foi feito no painel — mais recente primeiro.</div>
      {loading ? <div className="bt-card-sub">Carregando...</div> : logs.length === 0 ? (
        <div className="bt-card-sub">Nenhuma ação registrada ainda.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 420, overflowY: "auto" }}>
          {logs.map((l) => (
            <div key={l.id} style={{ fontSize: 13, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--ink-faint)" }}>{new Date(l.created_at).toLocaleString("pt-BR")}</span>
              {" · "}<strong>{l.actorName}</strong>{" · "}{l.action}
              {l.details && <span style={{ color: "var(--ink-soft)" }}> — {formatLogDetails(l.details)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const REPORT_GROUPS = [
  { group: "Quadra", items: ["Agendamentos", "Ocupação", "Produtos/planos", "Vendas"] },
  { group: "Bar", items: ["Produtos vendidos", "Consumo por período", "Comandas", "Mesas", "Produtos mais vendidos"] },
  { group: "Clientes", items: ["Clientes cadastrados", "Ativos/inativos", "Utilização da quadra", "Consumo no bar"] },
];
function RelatoriosView({ notify, staff }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {staff.is_owner && <HistoricoAlteracoes notify={notify} />}
      <div className="bt-card-sub">Estrutura modular, pronta para exportação em Excel (.xlsx) assim que cada relatório for definido.</div>
      <div className="bt-grid-3">
        {REPORT_GROUPS.map((g) => (
          <div className="bt-card" key={g.group}>
            <div className="bt-card-title" style={{ marginBottom: 12 }}>{g.group}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map((it) => (
                <div key={it} className="bt-row" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13 }}>{it}</span>
                  <span className="bt-badge bt-badge-muted">Estrutura pronta</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   CONFIGURAÇÕES — empresa, WhatsApp, turnos e funcionários (tudo real)
   ========================================================================= */
function StaffModal({ staffMember, onClose, onSave, notify }) {
  const isNew = !staffMember;
  const [id, setId] = useState(staffMember?.id || "");
  const [nome, setNome] = useState(staffMember?.name || "");
  const [status, setStatus] = useState(staffMember?.status || "ativo");
  const [permissoes, setPermissoes] = useState(staffMember?.permissions || []);
  const [saving, setSaving] = useState(false);

  const togglePerm = (m) => setPermissoes((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const save = async () => {
    if (!id.trim() || !nome.trim()) { notify("UID e nome são obrigatórios."); return; }
    setSaving(true);
    try {
      await upsertStaff({ id, name: nome, status, permissions: permissoes });
      notify("Funcionário salvo.");
      onSave();
      onClose();
    } catch (e) {
      notify("Erro ao salvar: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="bt-panel-overlay" onClick={onClose}>
      <div className="bt-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 18 }} onClick={onClose}>
          <ChevronLeft size={17} /> <span style={{ fontSize: 13, fontWeight: 700 }}>Fechar</span>
        </div>
        <div className="bt-card-title" style={{ fontSize: 19, marginBottom: 18 }}>{isNew ? "Novo funcionário" : `Editar ${staffMember.name}`}</div>

        {isNew && (
          <div className="bt-field">
            <div className="bt-label">UID do login (Supabase → Authentication → Users)</div>
            <input className="bt-input" value={id} onChange={(e) => setId(e.target.value)} placeholder="Crie o login lá primeiro e cole o UID aqui" />
          </div>
        )}
        <div className="bt-field"><div className="bt-label">Nome</div><input className="bt-input" value={nome} onChange={(e) => setNome(e.target.value)} /></div>
        <label className="bt-row" style={{ fontSize: 13, marginBottom: 18 }}>
          <span>Login ativo</span>
          <input type="checkbox" checked={status === "ativo"} onChange={(e) => setStatus(e.target.checked ? "ativo" : "inativo")} />
        </label>

        <div className="bt-label" style={{ marginBottom: 8 }}>Abas / módulos permitidos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20, maxHeight: 240, overflowY: "auto" }}>
          {MODULES_LIST.map((m) => (
            <label key={m} className="bt-row" style={{ fontSize: 13.5, padding: "6px 0" }}>
              <span>{m}</span>
              <input type="checkbox" checked={permissoes.includes(m)} onChange={() => togglePerm(m)} />
            </label>
          ))}
        </div>
        <button className="bt-btn bt-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={saving} onClick={save}>
          {saving ? "Salvando..." : "Salvar funcionário"}
        </button>
      </div>
    </div>
  );
}

function ConfiguracoesView({ notify, staff }) {
  const [companyName, setCompanyName] = useState(BRAND.name);
  const [companyPhone, setCompanyPhone] = useState("");
  const [msg, setMsg] = useState("Olá, {nome}! Seu agendamento para {data} às {horario} foi realizado com sucesso.");
  const [mesasCount, setMesasCount] = useState(50);
  const [shifts, setShifts] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [staffList, setStaffList] = useState([]);
  const [editingStaff, setEditingStaff] = useState(undefined);
  const variables = ["{nome}", "{telefone}", "{data}", "{horario}", "{produto}", "{valor}"];

  const loadSettings = async () => {
    const company = await fetchSetting("company", { name: BRAND.name, phone: "" });
    setCompanyName(company.name); setCompanyPhone(company.phone);
    setMsg(await fetchSetting("whatsapp_message", msg));
    setMesasCount(await fetchSetting("mesas_count", 50));
    setShifts(await fetchAllShifts());
    if (staff.is_owner) setStaffList(await fetchStaff());
  };
  useEffect(() => { loadSettings(); }, []);

  const dayShifts = shifts.filter((s) => s.weekday === selectedDay);
  const updateTurno = async (id, field, value) => { await updateShift(id, { [field]: value }); setShifts((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s)); };
  const removeTurno = async (id) => { await deleteShift(id); setShifts((prev) => prev.filter((s) => s.id !== id)); };
  const addTurno = async () => {
    await createShift({ weekday: selectedDay, label: "Novo turno", start_hour: 9, end_hour: 10 });
    setShifts(await fetchAllShifts());
  };
  const copyToWeekdays = async () => {
    for (const wd of [1, 2, 3, 4, 5, 6]) {
      const existing = shifts.filter((s) => s.weekday === wd);
      for (const ex of existing) await deleteShift(ex.id);
      for (const s of dayShifts) await createShift({ weekday: wd, label: s.label, start_hour: s.start_hour, end_hour: s.end_hour });
    }
    notify("Turnos copiados para segunda–sábado.");
    setShifts(await fetchAllShifts());
  };

  const toggleStaffStatusLocal = async (s) => { await toggleStaffStatus(s.id, s.status); setStaffList(await fetchStaff()); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="bt-card">
        <div className="bt-card-title" style={{ marginBottom: 14 }}>Dados da empresa</div>
        <div className="bt-grid-2">
          <div>
            <div className="bt-field"><div className="bt-label">Nome do estabelecimento</div><input className="bt-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
            <div className="bt-field"><div className="bt-label">Telefone</div><input className="bt-input" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} /></div>
          </div>
          <div>
            <div className="bt-label">Logo</div>
            <div style={{ border: "1.5px solid var(--border)", borderRadius: 10, padding: 20, textAlign: "center", color: "var(--ink-soft)", fontSize: 12.5 }}>
              <div className="bt-logo-badge" style={{ margin: "0 auto 10px", width: 64, height: 64, borderRadius: 14 }}><img src={BRAND.logo} alt={BRAND.name} /></div>
              Trocar a logo é feito direto no código (src/assets), não por aqui.
            </div>
          </div>
        </div>
        <button className="bt-btn bt-btn-primary" style={{ marginTop: 14 }} onClick={async () => { await saveSetting("company", { name: companyName, phone: companyPhone }); notify("Dados da empresa salvos."); }}>Salvar</button>
      </div>

      <div className="bt-card">
        <div className="bt-card-title">WhatsApp</div>
        <div className="bt-card-sub" style={{ marginBottom: 14 }}>Mensagem de confirmação enviada após o agendamento.</div>
        <div className="bt-field">
          <div className="bt-label">Mensagem de confirmação</div>
          <textarea className="bt-textarea" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {variables.map((v) => <span key={v} className="bt-var-chip" onClick={() => setMsg((m) => `${m} ${v}`)}>{v}</span>)}
        </div>
        <button className="bt-btn bt-btn-primary" onClick={async () => { await saveSetting("whatsapp_message", msg); notify("Mensagem salva."); }}>Salvar</button>
      </div>

      <div className="bt-card">
        <div className="bt-card-title" style={{ marginBottom: 4 }}>Agenda — turnos por dia da semana</div>
        <div className="bt-card-sub" style={{ marginBottom: 14 }}>Cada dia pode ter turnos diferentes — um dia sem nenhum turno fica fechado.</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {DAYS_OF_WEEK.map((d) => (
            <div key={d.id} className={`bt-chip ${selectedDay === d.id ? "active" : ""}`} onClick={() => setSelectedDay(d.id)}>
              {d.short}{shifts.filter((s) => s.weekday === d.id).length === 0 && <span style={{ marginLeft: 5, opacity: .6 }}>· fechado</span>}
            </div>
          ))}
        </div>
        <div className="bt-row" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{DAYS_OF_WEEK.find((d) => d.id === selectedDay).label}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={copyToWeekdays}>Copiar para seg–sáb</button>
            <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={addTurno}><Plus size={13} /> Turno</button>
          </div>
        </div>
        {dayShifts.length === 0 ? (
          <div className="bt-card-sub" style={{ padding: "10px 0" }}>Fechado neste dia.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dayShifts.map((t) => (
              <div key={t.id} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ flex: 1.4 }}><div className="bt-label">Nome</div><input className="bt-input" value={t.label} onChange={(e) => updateTurno(t.id, "label", e.target.value)} /></div>
                <div style={{ flex: 1 }}><div className="bt-label">Início</div><input type="number" className="bt-input" value={t.start_hour} onChange={(e) => updateTurno(t.id, "start_hour", Number(e.target.value))} /></div>
                <div style={{ flex: 1 }}><div className="bt-label">Fim</div><input type="number" className="bt-input" value={t.end_hour} onChange={(e) => updateTurno(t.id, "end_hour", Number(e.target.value))} /></div>
                <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => removeTurno(t.id)}>Remover</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bt-card">
        <div className="bt-card-title" style={{ marginBottom: 14 }}>Mesas</div>
        <div className="bt-field" style={{ maxWidth: 200 }}>
          <div className="bt-label">Quantidade de mesas</div>
          <input type="number" className="bt-input" value={mesasCount} onChange={(e) => setMesasCount(Number(e.target.value))} />
        </div>
        <button className="bt-btn bt-btn-primary" onClick={async () => { await saveSetting("mesas_count", mesasCount); notify("Quantidade de mesas salva."); }}>Salvar</button>
      </div>

      {staff.is_owner && (
        <div className="bt-card">
          <div className="bt-row" style={{ marginBottom: 14 }}>
            <div>
              <div className="bt-card-title">Funcionários</div>
              <div className="bt-card-sub">Só o dono gerencia funcionários. Crie o login em Authentication no Supabase antes de cadastrar aqui.</div>
            </div>
            <button className="bt-btn bt-btn-primary" onClick={() => setEditingStaff(null)}><Plus size={15} /> Novo funcionário</button>
          </div>
          <table className="bt-table">
            <thead><tr><th>Nome</th><th>Status</th><th>Permissões</th><th></th></tr></thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}{s.is_owner ? " (dono)" : ""}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {(s.permissions || []).slice(0, 3).map((p) => <span key={p} className="bt-badge bt-badge-muted">{p}</span>)}
                      {(s.permissions || []).length > 3 && <span className="bt-badge bt-badge-muted">+{s.permissions.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => setEditingStaff(s)}>Editar</button>{" "}
                    {!s.is_owner && <button className="bt-btn bt-btn-ghost bt-btn-sm" onClick={() => toggleStaffStatusLocal(s)}>{s.status === "ativo" ? "Desativar" : "Ativar"}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingStaff !== undefined && (
        <StaffModal staffMember={editingStaff} onClose={() => setEditingStaff(undefined)} onSave={async () => setStaffList(await fetchStaff())} notify={notify} />
      )}
    </div>
  );
}

/* =========================================================================
   APP
   ========================================================================= */
export default function AdminPanel({ staff, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  return (
    <div className="bt-app">
      <style>{CSS}</style>
      <Sidebar view={view} setView={(v) => { setView(v); setSidebarOpen(false); }} open={sidebarOpen} staff={staff} />
      <div className="bt-main">
        <TopBar view={view} staff={staff} onLogout={onLogout} onMenu={() => setSidebarOpen((s) => !s)} />
        <div className="bt-content">
          {view === "dashboard" && <DashboardView />}
          {view === "agenda" && <AgendaView notify={notify} />}
          {view === "recorrencias" && <RecorrenciasView notify={notify} />}
          {view === "planosQuadra" && <ProductsCrud productType="court" notify={notify} showCategory={false} />}
          {view === "mesas" && <MesasView />}
          {view === "produtosBar" && <ProductsCrud productType="bar" notify={notify} showCategory={true} />}
          {view === "clientes" && <ClientesView notify={notify} />}
          {view === "vendas" && <VendasView notify={notify} />}
          {view === "devedores" && <DevedoresView notify={notify} />}
          {view === "relatorios" && <RelatoriosView notify={notify} staff={staff} />}
          {view === "config" && <ConfiguracoesView notify={notify} staff={staff} />}
        </div>
      </div>
      {toast && <div className="bt-toast">{toast}</div>}
      {sidebarOpen && <div className="bt-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
