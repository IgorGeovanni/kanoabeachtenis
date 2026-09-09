import { createClient } from "@supabase/supabase-js";

// Essas duas variáveis vêm de fora do código — nunca escreva a chave direto
// aqui. Localmente, elas vêm do arquivo .env (veja .env.example). No site
// publicado, vêm das Environment variables configuradas no Netlify.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase não configurado: faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
    "Veja o .env.example na raiz do projeto."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
