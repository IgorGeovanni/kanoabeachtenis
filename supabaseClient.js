import { createClient } from "@supabase/supabase-js";

// Essas duas variáveis vêm de fora do código — nunca escreva a chave direto
// aqui. Localmente, elas vêm do arquivo .env (veja .env.example). No site
// publicado, vêm das Environment variables configuradas no Netlify.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase = null;
export let supabaseConfigError = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseConfigError =
    "Faltam as variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Configure as duas no Netlify (Site configuration → Environment variables) e depois dispare um novo deploy (Deploys → Trigger deploy).";
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    supabaseConfigError =
      `Não foi possível conectar ao Supabase (${err.message}). Confira se VITE_SUPABASE_URL está exatamente no formato https://xxxxxxxx.supabase.co — sem espaço, sem aspas e sem barra "/" sobrando no final.`;
  }
}
