// ============================================================
// Serviço de Motoristas — KlionTour
// ============================================================
import { createClient } from "@/lib/supabase";

export async function getMotoristas({ apenasAtivos = true } = {}) {
  const supabase = createClient();
  let query = supabase.from("motoristas").select("*").order("nome_completo");
  if (apenasAtivos) query = query.eq("ativo", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getMotorista(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motoristas")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createMotorista(payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motoristas")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMotorista(id, payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motoristas")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Soft delete (desativa)
export async function deactivateMotorista(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from("motoristas")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
