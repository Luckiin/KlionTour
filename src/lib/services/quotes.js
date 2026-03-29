// ============================================================
// Serviço de Cotações — KlionTour
// ============================================================
import { createClient } from "@/lib/supabase";

// ─── Busca todas as cotações (admin) ──────────────────────
export async function getAllQuotes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*, motorista:motoristas(id, nome_completo), veiculo:veiculos(id, placa, modelo)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Busca cotações do usuário logado (cliente) ────────────
export async function getMyQuotes(userId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Cria nova cotação ────────────────────────────────────
export async function createQuote(payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Atualiza status / dados de uma cotação (admin) ───────
export async function updateQuote(id, updates) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Deleta cotação (admin) ───────────────────────────────
export async function deleteQuote(id) {
  const supabase = createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
