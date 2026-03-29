// ============================================================
// Serviço de Usuários — KlionTour
// ============================================================
import { createClient } from "@/lib/supabase";

// ─── Busca todos os clientes (admin) ──────────────────────
export async function getAllClients() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Busca perfil por auth_id ─────────────────────────────
export async function getProfileByAuthId(authId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Atualiza perfil do usuário ───────────────────────────
export async function updateProfile(id, updates) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
