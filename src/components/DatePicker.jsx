import { dateKey, SCHEDULE } from "../data/courtData";

function buildDays(count = 14) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function DatePicker({ selected, onSelect }) {
  const days = buildDays();
  return (
    <div className="kn-date-row">
      {days.map((d) => {
        const key = dateKey(d);
        const isActive = selected && dateKey(selected) === key;
        const closed = (SCHEDULE[d.getDay()] || []).length === 0;
        return (
          <div
            key={key}
            className={`kn-date-chip ${isActive ? "active" : ""} ${closed ? "closed" : ""}`}
            onClick={() => !closed && onSelect(d)}
          >
            <div className="dow">{d.toLocaleDateString("pt-BR", { weekday: "short" })}</div>
            <div className="num">{d.getDate()}</div>
          </div>
        );
      })}
    </div>
  );
}
