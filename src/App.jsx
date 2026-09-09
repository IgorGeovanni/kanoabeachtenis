import PublicSite from "./pages/PublicSite";
import AdminGate from "./components/AdminGate";
import AdminPanel from "./pages/Admin";

// Sem biblioteca de rotas — simples de propósito. Se o caminho digitado
// for /admin, mostra o painel (atrás da senha); qualquer outro caminho
// mostra o site público. O netlify.toml já redireciona tudo para o
// index.html, então essa checagem no navegador é suficiente.
function isAdminPath() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.replace(/\/+$/, "") === "/admin";
}

export default function App() {
  if (isAdminPath()) {
    return (
      <AdminGate>
        <AdminPanel />
      </AdminGate>
    );
  }
  return <PublicSite />;
}
