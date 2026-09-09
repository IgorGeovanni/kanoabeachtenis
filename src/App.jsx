import PublicSite from "./pages/PublicSite";
import AdminGate from "./components/AdminGate";
import { supabaseConfigError } from "./supabaseClient";

// Sem biblioteca de rotas — simples de propósito. Se o caminho digitado
// for /admin, mostra o painel (atrás do login real); qualquer outro
// caminho mostra o site público.
function isAdminPath() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.replace(/\/+$/, "") === "/admin";
}

export default function App() {
  if (supabaseConfigError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F3EE", padding: 24, fontFamily: "sans-serif" }}>
        <div style={{ maxWidth: 480, background: "#fff", border: "1.5px solid #C1443C", borderRadius: 14, padding: 26 }}>
          <div style={{ fontWeight: 800, color: "#C1443C", marginBottom: 10, fontSize: 16 }}>Configuração do Supabase pendente</div>
          <div style={{ fontSize: 14, color: "#1E1B18", lineHeight: 1.6 }}>{supabaseConfigError}</div>
        </div>
      </div>
    );
  }

  if (isAdminPath()) {
    return <AdminGate />;
  }
  return <PublicSite />;
}
