import { useState } from "react";
import { CalendarDays, UtensilsCrossed } from "lucide-react";
import { BRAND } from "../brand";

export default function Landing({ onStartBooking }) {
  const [showMenuNote, setShowMenuNote] = useState(false);

  return (
    <div className="kn-shell">
      <div className="kn-hero">
        <div className="kn-hero-logo"><img src={BRAND.logo} alt={BRAND.name} /></div>
        <div className="kn-hero-title">{BRAND.name}</div>
        <div className="kn-hero-sub">O que você deseja fazer?</div>
      </div>

      <div className="kn-choice-grid">
        <div className="kn-choice-card" onClick={onStartBooking}>
          <div className="kn-choice-icon"><CalendarDays size={22} /></div>
          <div>
            <div className="kn-choice-title">Agendar quadra</div>
            <div className="kn-choice-sub">Escolha data, horário e pacote</div>
          </div>
        </div>

        <div className="kn-choice-card" onClick={() => setShowMenuNote(true)}>
          <div className="kn-choice-icon"><UtensilsCrossed size={22} /></div>
          <div>
            <div className="kn-choice-title">Ver cardápio</div>
            <div className="kn-choice-sub">Bebidas, porções e lanches do bar</div>
          </div>
        </div>
      </div>

      {showMenuNote && (
        <div className="kn-note-box">
          O cardápio digital estará disponível em breve por aqui.
        </div>
      )}
    </div>
  );
}
