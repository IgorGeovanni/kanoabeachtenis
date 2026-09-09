import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import DatePicker from "../components/DatePicker";
import TimeSlotGrid from "../components/TimeSlotGrid";
import ProductList from "../components/ProductList";
import ClientForm from "../components/ClientForm";
import ConfirmationScreen from "../components/ConfirmationScreen";
import { formatDateLabel } from "../data/courtData";

const EMPTY_CLIENT = { nome: "", telefone: "", cpf: "", nascimento: "" };

function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Booking({ onBack }) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [product, setProduct] = useState(null);
  const [client, setClient] = useState(EMPTY_CLIENT);
  const [confirmed, setConfirmed] = useState(false);

  const reset = () => {
    setStep(1);
    setDate(null);
    setTime(null);
    setProduct(null);
    setClient(EMPTY_CLIENT);
    setConfirmed(false);
  };

  if (confirmed) {
    return (
      <div className="kn-shell">
        <ConfirmationScreen booking={{ date, time, product, client }} onReset={reset} />
      </div>
    );
  }

  const canContinue =
    (step === 1 && !!date) ||
    (step === 2 && !!time) ||
    (step === 3 && !!product) ||
    (step === 4 && client.nome.trim() && client.telefone.trim());

  const goBack = () => {
    if (step === 1) onBack();
    else setStep((s) => s - 1);
  };

  return (
    <div className="kn-shell">
      <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 18, color: "var(--ink-soft)", fontSize: 13.5, fontWeight: 600 }} onClick={goBack}>
        <ChevronLeft size={16} /> Voltar
      </div>

      <StepIndicator current={step} />

      <div className="kn-card">
        {step === 1 && (
          <>
            <div className="kn-card-title">Escolha a data</div>
            <div className="kn-card-sub">Selecione o dia em que deseja jogar.</div>
            <DatePicker selected={date} onSelect={setDate} />
          </>
        )}

        {step === 2 && (
          <>
            <div className="kn-card-title">Escolha o horário</div>
            <div className="kn-card-sub">{date && formatDateLabel(date)} — horários disponíveis para a quadra.</div>
            <TimeSlotGrid date={date} selected={time} onSelect={setTime} />
          </>
        )}

        {step === 3 && (
          <>
            <div className="kn-card-title">Escolha o pacote</div>
            <div className="kn-card-sub">Planos e pacotes disponíveis para essa reserva.</div>
            <ProductList selected={product} onSelect={setProduct} />
          </>
        )}

        {step === 4 && (
          <>
            <div className="kn-card-title">Seus dados</div>
            <div className="kn-card-sub">Nome e telefone são obrigatórios — o restante é opcional.</div>
            <ClientForm value={client} onChange={setClient} />
          </>
        )}

        {step === 5 && (
          <>
            <div className="kn-card-title">Confirme seu agendamento</div>
            <div className="kn-card-sub">Revise os dados antes de confirmar.</div>
            <div>
              <div className="kn-summary-row"><span className="kn-summary-label">Data</span><span className="kn-summary-value">{formatDateLabel(date)}</span></div>
              <div className="kn-summary-row"><span className="kn-summary-label">Horário</span><span className="kn-summary-value">{time}</span></div>
              <div className="kn-summary-row"><span className="kn-summary-label">Pacote</span><span className="kn-summary-value">{product.name}</span></div>
              <div className="kn-summary-row"><span className="kn-summary-label">Valor</span><span className="kn-summary-value">{formatBRL(product.price)}</span></div>
              <div className="kn-summary-row"><span className="kn-summary-label">Nome</span><span className="kn-summary-value">{client.nome}</span></div>
              <div className="kn-summary-row"><span className="kn-summary-label">Telefone</span><span className="kn-summary-value">{client.telefone}</span></div>
            </div>
          </>
        )}

        <div className="kn-nav-row">
          {step < 5 && (
            <button className="kn-btn kn-btn-primary" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
              Continuar
            </button>
          )}
          {step === 5 && (
            <button className="kn-btn kn-btn-primary" onClick={() => setConfirmed(true)}>
              Confirmar agendamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
