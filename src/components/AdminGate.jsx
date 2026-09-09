import { useState } from "react";

// ATENÇÃO: isto NÃO é segurança de verdade. É uma trava simples só para
// evitar que alguém entre sem querer no /admin — o código roda no navegador
// de quem acessa, então dá para contornar por quem souber mexer no
// DevTools. Quando o Supabase Auth entrar no projeto, troque isto por login
// real (com o cadastro de funcionários e permissões já desenhado no painel).
const ADMIN_PASSWORD = "kanoa2026";
const SESSION_KEY = "kanoa_admin_ok";

export default function AdminGate({ children }) {
  const [ok, setOk] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (ok) return children;

  const submit = (e) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setOk(true);
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F3EE", fontFamily: "sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #E7E0D6", borderRadius: 16, padding: 32, width: 320 }}>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: "#1E1B18" }}>Área administrativa</div>
        <div style={{ fontSize: 13, color: "#6B6259", marginBottom: 18 }}>Acesso restrito à equipe.</div>
        <input
          type="password"
          autoFocus
          placeholder="Senha"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${error ? "#C1443C" : "#E7E0D6"}`, marginBottom: 10, fontSize: 14 }}
        />
        {error && <div style={{ color: "#C1443C", fontSize: 12.5, marginBottom: 10 }}>Senha incorreta.</div>}
        <button type="submit" style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: "#C8935C", color: "#2C1B0C", fontWeight: 700, cursor: "pointer" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}
