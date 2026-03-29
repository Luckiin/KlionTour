// ============================================================
// Serviço de Veículos — KlionTour
// ============================================================
import { createClient } from "@/lib/supabase";

export async function getVeiculos({ apenasAtivos = true } = {}) {
  const supabase = createClient();
  let query = supabase.from("veiculos").select("*").order("modelo");
  if (apenasAtivos) query = query.eq("ativo", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getVeiculo(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createVeiculo(payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("veiculos")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVeiculo(id, payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("veiculos")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Soft delete (desativa)
export async function deactivateVeiculo(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from("veiculos")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
