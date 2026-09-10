// ============================================================================
// CONFIGURAÇÃO DA MARCA
// Ponto único para trocar nome, logo e cores quando algo mudar na identidade
// visual. Nada além deste arquivo deveria precisar ser tocado para isso.
// ============================================================================
import logo from "./assets/kanoa-logo.jpg";

export const BRAND = {
  name: "Kanoa",
  tagline: "Beach Tennis & Bar",
  logo,
  whatsappNumber: "5517999999999", // formato internacional, sem símbolos — ajuste depois
  colors: {
    ink: "#1E1B18",
    wood: "#CDAF95",
    accent: "#C8935C",
    accentDeep: "#A8703C",
  },
};
