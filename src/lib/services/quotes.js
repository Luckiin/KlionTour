// ============================================================
// Serviço de Cotações — KlionTour
// ============================================================
import { createClient } from "@/lib/supabase";

// ─── Busca todas as cotações (admin) ──────────────────────
export async function getAllQuotes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
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
  
  // 1. Atualiza a cotação
  const { data: quote, error } = await supabase
    .from("quotes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 2. Automação Financeira: Se aprovado, criar "A Receber"
  if (updates.status === "approved" || updates.status === "paid") {
    try {
      // Verificar se já existe lançamento para esta cotação
      const { data: existing } = await supabase
        .from("lancamentos")
        .select("id")
        .eq("quote_id", id)
        .maybeSingle();

      if (!existing) {
        // Pegar a primeira conta disponível
        const { data: contas } = await supabase.from("contas").select("id").limit(1);
        const contaId = contas?.[0]?.id || null;

        // Criar o lançamento
        await supabase.from("lancamentos").insert({
          descricao: `Recebimento Cotação: ${quote.from_city} -> ${quote.to_city}`,
          valor: quote.total_price || 0,
          tipo: "receita",
          status: updates.status === "paid" ? "pago" : "pendente",
          data_vencimento: quote.date || new Date().toISOString().slice(0, 10),
          data_pagamento: updates.status === "paid" ? new Date().toISOString().slice(0, 10) : null,
          valor_pago: updates.status === "paid" ? (quote.total_price || 0) : null,
          quote_id: id,
          cliente_id: quote.user_id || null,
          conta_id: contaId
        });
      } else if (updates.status === "paid") {
        // Se já existe e foi pago agora, atualiza o lançamento
        await supabase.from("lancamentos")
          .update({ 
            status: "pago", 
            data_pagamento: new Date().toISOString().slice(0, 10),
            valor_pago: quote.total_price || 0
          })
          .eq("quote_id", id);
      }
    } catch (finErr) {
      // Não bloqueia a atualização da cotação se o financeiro falhar
    }
  }

  return quote;
}

// ─── Deleta cotação (admin) ───────────────────────────────
export async function deleteQuote(id) {
  const supabase = createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
