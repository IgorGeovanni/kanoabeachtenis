import { supabase } from "../supabaseClient";

export const DEFAULT_MENU_CATEGORIES = ["Bebidas", "Petiscos", "Porções", "Comidas", "Lanches", "Sobremesas", "Outros"];

// Só produtos do bar, ativos e marcados para aparecer no cardápio.
export async function fetchMenuProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, image_url")
    .eq("product_type", "bar")
    .eq("status", "ativo")
    .eq("show_in_menu", true)
    .order("name");
  if (error) throw error;
  return data;
}

// Ordem das categorias configurada em Configurações → Categorias do Cardápio.
export async function fetchMenuCategoriesOrder() {
  const { data, error } = await supabase.from("settings").select("value").eq("key", "menu_categories").maybeSingle();
  if (error || !data) return DEFAULT_MENU_CATEGORIES;
  return data.value;
}
