import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { fetchMenuProducts } from "../data/menuData";

function formatBRL(n) {
  return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Menu({ onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchMenuProducts()
      .then(setProducts)
      .catch(() => setErrorMsg("Não foi possível carregar o cardápio agora."))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category || "Outros"))];

  return (
    <div className="kn-shell">
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 18, color: "var(--ink-soft)", fontSize: 13.5, fontWeight: 600 }}
        onClick={onBack}
      >
        <ChevronLeft size={16} /> Voltar
      </div>

      <div className="kn-card-title" style={{ fontSize: 20, marginBottom: 4 }}>Cardápio</div>
      <div className="kn-card-sub" style={{ marginBottom: 22 }}>Só para consulta — feche o pedido direto com a equipe no local.</div>

      {loading && <div className="kn-card-sub">Carregando cardápio...</div>}
      {errorMsg && <div className="kn-card-sub" style={{ color: "var(--danger)" }}>{errorMsg}</div>}
      {!loading && !errorMsg && products.length === 0 && (
        <div className="kn-card-sub">Cardápio ainda não cadastrado.</div>
      )}

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            {cat}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {products.filter((p) => (p.category || "Outros") === cat).map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 12 }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--wood-soft)", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>{p.description}</div>}
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, marginTop: 6, color: "var(--accent-deep)" }}>{formatBRL(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
