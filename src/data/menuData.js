import { supabase } from "../supabaseClient";

// Só produtos do bar, ativos — o mesmo cadastro usado nas comandas do painel.
export async function fetchMenuProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, image_url")
    .eq("product_type", "bar")
    .eq("status", "ativo")
    .order("category")
    .order("name");
  if (error) throw error;
  return data;
}
