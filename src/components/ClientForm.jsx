import { useState } from "react";

export default function ClientForm({ value, onChange }) {
  const [showMore, setShowMore] = useState(false);

  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div>
      <div className="kn-field">
        <label className="kn-label">Nome *</label>
        <input className="kn-input" placeholder="Seu nome completo" value={value.nome} onChange={set("nome")} />
      </div>
      <div className="kn-field">
        <label className="kn-label">Telefone *</label>
        <input className="kn-input" placeholder="(17) 99999-9999" value={value.telefone} onChange={set("telefone")} />
      </div>

      <div className="kn-more-toggle" onClick={() => setShowMore((s) => !s)}>
        {showMore ? "− Ocultar dados adicionais" : "+ Preencher mais dados (opcional)"}
      </div>

      {showMore && (
        <div style={{ marginTop: 14 }}>
          <div className="kn-field">
            <label className="kn-label">CPF</label>
            <input className="kn-input" placeholder="000.000.000-00" value={value.cpf} onChange={set("cpf")} />
          </div>
          <div className="kn-field">
            <label className="kn-label">Data de nascimento</label>
            <input type="date" className="kn-input" value={value.nascimento} onChange={set("nascimento")} />
          </div>
        </div>
      )}
    </div>
  );
}
