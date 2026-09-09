import { fillTemplate, formatDateLabel } from "../data/courtData";

function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ConfirmationScreen({ booking, whatsappTemplate, onReset }) {
  const { date, time, product, client } = booking;
  const message = fillTemplate(whatsappTemplate, {
    nome: client.nome,
    data: date.toLocaleDateString("pt-BR"),
    horario: time,
    produto: product.name,
    valor: formatBRL(product.price),
    telefone: client.telefone,
  });

  return (
    <div className="kn-card">
      <div className="kn-success-icon">✓</div>
      <div className="kn-card-title" style={{ textAlign: "center" }}>Agendamento confirmado!</div>
      <div className="kn-card-sub" style={{ textAlign: "center" }}>Anote os detalhes abaixo — te esperamos na quadra.</div>

      <div>
        <div className="kn-summary-row"><span className="kn-summary-label">Data</span><span className="kn-summary-value">{formatDateLabel(date)}</span></div>
        <div className="kn-summary-row"><span className="kn-summary-label">Horário</span><span className="kn-summary-value">{time}</span></div>
        <div className="kn-summary-row"><span className="kn-summary-label">Pacote</span><span className="kn-summary-value">{product.name}</span></div>
        <div className="kn-summary-row"><span className="kn-summary-label">Valor</span><span className="kn-summary-value">{formatBRL(product.price)}</span></div>
        <div className="kn-summary-row"><span className="kn-summary-label">Cliente</span><span className="kn-summary-value">{client.nome}</span></div>
      </div>

      <div className="kn-whatsapp-preview">{message}</div>

      <div className="kn-nav-row">
        <button className="kn-btn kn-btn-primary" onClick={onReset}>Fazer novo agendamento</button>
      </div>
    </div>
  );
}
