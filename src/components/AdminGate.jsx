import { useState, useEffect } from "react";
import { signIn, signOut, getCurrentSession, fetchMyStaffRecord } from "../admin/adminData";
import AdminPanel from "../pages/Admin";

export default function AdminGate() {
  const [checking, setChecking] = useState(true);
  const [staff, setStaff] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStaff = async () => {
    const session = await getCurrentSession();
    if (!session) {
      setStaff(null);
      setChecking(false);
      return;
    }
    try {
      const record = await fetchMyStaffRecord();
      if (!record || record.status !== "ativo") {
        setError("Este login não tem acesso liberado ao painel. Fale com o dono do sistema.");
        await signOut();
        setStaff(null);
      } else {
        setStaff(record);
      }
    } catch (e) {
      setError("Não foi possível confirmar seu acesso. Tente novamente.");
    }
    setChecking(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      await loadStaff();
    } catch (err) {
      setError("E-mail ou senha incorretos.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    setStaff(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F3EE", fontFamily: "sans-serif", color: "#6B6259" }}>
        Carregando...
      </div>
    );
  }

  if (staff) {
    return <AdminPanel staff={staff} onLogout={handleLogout} />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F3EE", fontFamily: "sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #E7E0D6", borderRadius: 16, padding: 32, width: 320 }}>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: "#1E1B18" }}>Área administrativa</div>
        <div style={{ fontSize: 13, color: "#6B6259", marginBottom: 18 }}>Entre com seu login de funcionário.</div>
        <input
          type="email"
          autoFocus
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E7E0D6", marginBottom: 10, fontSize: 14 }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E7E0D6", marginBottom: 10, fontSize: 14 }}
        />
        {error && <div style={{ color: "#C1443C", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: "#C8935C", color: "#2C1B0C", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
