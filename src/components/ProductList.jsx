import { PRODUCTS } from "../data/courtData";

function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductList({ selected, onSelect }) {
  return (
    <div className="kn-product-list">
      {PRODUCTS.map((p) => (
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
