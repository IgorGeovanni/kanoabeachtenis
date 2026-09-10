const STEPS = ["Data", "Horário", "Pacote", "Dados", "Confirmação"];

export default function StepIndicator({ current }) {
  return (
    <div className="kn-steps">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className={`kn-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
            {i > 0 && <div className="kn-step-line" style={{ left: "-50%" }} />}
            <div className="kn-step-dot">{done ? "✓" : stepNum}</div>
            <div className="kn-step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
