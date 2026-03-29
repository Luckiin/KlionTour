// ============================================================
// Serviço Financeiro — KlionTour
// ============================================================
import { createClient } from "@/lib/supabase";

// ─── RECEITAS ─────────────────────────────────────────────
export async function getRevenues({ year, month } = {}) {
  const supabase = createClient();
  let query = supabase
    .from("revenues")
    .select("*")
    .order("date", { ascending: false });

  if (year && month) {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end   = new Date(year, month, 0).toISOString().split("T")[0]; // último dia
    query = query.gte("date", start).lte("date", end);
  } else if (year) {
    query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createRevenue(payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("revenues")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRevenue(id) {
  const supabase = createClient();
  const { error } = await supabase.from("revenues").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── DESPESAS ─────────────────────────────────────────────
export async function getExpenses({ year, month } = {}) {
  const supabase = createClient();
  let query = supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (year && month) {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end   = new Date(year, month, 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  } else if (year) {
    query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createExpense(payload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteExpense(id) {
  const supabase = createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
