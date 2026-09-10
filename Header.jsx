import { BRAND } from "../brand";

export default function Header() {
  return (
    <div className="kn-header">
      <div className="kn-logo">
        <img src={BRAND.logo} alt={BRAND.name} />
      </div>
      <div>
        <div className="kn-brand-name">{BRAND.name}</div>
        <div className="kn-brand-tag">{BRAND.tagline}</div>
      </div>
    </div>
  );
}
