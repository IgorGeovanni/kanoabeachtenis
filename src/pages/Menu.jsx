import { useState, useEffect } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { fetchMenuProducts, fetchMenuCategoriesOrder, DEFAULT_MENU_CATEGORIES } from "../data/menuData";

function formatBRL(n) {
  return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Menu({ onBack }) {
  const [products, setProducts] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState(DEFAULT_MENU_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([fetchMenuProducts(), fetchMenuCategoriesOrder()])
      .then(([p, order]) => { setProducts(p); setCategoryOrder(order); })
      .catch(() => setErrorMsg("Não foi possível carregar o cardápio agora."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : products;

  // Categorias na ordem configurada; qualquer categoria fora da lista
  // (ex.: cadastrada depois) aparece no final, em ordem alfabética.
  const presentCategories = [...new Set(filtered.map((p) => p.category || "Outros"))];
  const orderedCategories = [
    ...categoryOrder.filter((c) => presentCategories.includes(c)),
    ...presentCategories.filter((c) => !categoryOrder.includes(c)).sort(),
  ];

  return (
    <div className="kn-shell">
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 18, color: "var(--ink-soft)", fontSize: 13.5, fontWeight: 600 }}
        onClick={onBack}
      >
        <ChevronLeft size={16} /> Voltar
      </div>

      <div className="kn-card-title" style={{ fontSize: 20, marginBottom: 4 }}>Cardápio</div>
      <div className="kn-card-sub" style={{ marginBottom: 16 }}>Só para consulta — feche o pedido direto com a equipe no local.</div>

      {!loading && !errorMsg && products.length > 0 && (
        <div style={{ position: "relative", marginBottom: 22 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--ink-faint)" }} />
          <input
            className="kn-input"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {loading && <div className="kn-card-sub">Carregando cardápio...</div>}
      {errorMsg && <div className="kn-card-sub" style={{ color: "var(--danger)" }}>{errorMsg}</div>}
      {!loading && !errorMsg && products.length === 0 && (
        <div className="kn-card-sub">Cardápio ainda não cadastrado.</div>
      )}
      {!loading && !errorMsg && products.length > 0 && filtered.length === 0 && (
        <div className="kn-card-sub">Nenhum produto encontrado para "{query}".</div>
      )}

      {orderedCategories.map((cat) => (
        <div key={cat} style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            {cat}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.filter((p) => (p.category || "Outros") === cat).map((p) => (
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
