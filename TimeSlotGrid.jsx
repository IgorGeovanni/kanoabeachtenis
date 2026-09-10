// Agora puramente visual: recebe os horários já calculados pelo banco.
export default function TimeSlotGrid({ slots, loading, selected, onSelect }) {
  if (loading) {
    return <div className="kn-card-sub" style={{ padding: "10px 0" }}>Carregando horários...</div>;
  }
  if (!slots || slots.length === 0) {
    return <div className="kn-card-sub" style={{ padding: "10px 0" }}>Fechado neste dia — escolha outra data.</div>;
  }

  const shifts = [...new Set(slots.map((s) => s.shift))];

  return (
    <div>
      {shifts.map((shiftName) => (
        <div key={shiftName} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>
            {shiftName}
          </div>
          <div className="kn-slot-grid">
            {slots.filter((s) => s.shift === shiftName).map((s) => (
              <div
                key={s.hour}
                className={`kn-slot ${!s.available ? "busy" : ""} ${selected === s.hour ? "active" : ""}`}
                onClick={() => s.available && onSelect(s.hour)}
              >
                {s.hour}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
