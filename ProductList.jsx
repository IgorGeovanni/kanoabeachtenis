function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Agora puramente visual: recebe a lista de planos já carregada do banco.
export default function ProductList({ products, loading, selected, onSelect }) {
  if (loading) {
    return <div className="kn-card-sub" style={{ padding: "10px 0" }}>Carregando pacotes...</div>;
  }
  return (
    <div className="kn-product-list">
      {products.map((p) => (
        <div key={p.id} className={`kn-product ${selected?.id === p.id ? "active" : ""}`} onClick={() => onSelect(p)}>
          <div>
            <div className="kn-product-name">{p.name}</div>
            <div className="kn-product-desc">{p.desc}</div>
          </div>
          <div className="kn-product-price">{formatBRL(p.price)}</div>
        </div>
      ))}
    </div>
  );
}
