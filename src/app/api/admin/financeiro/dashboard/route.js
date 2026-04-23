import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Pegar o usuário logado e verificar se é admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Busca o perfil para verificar o role
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Usamos o Admin Client para bypassar RLS no Dashboard e obter totais reais
    const { createAdminClient } = await import("@/lib/supabase-server");
    const adminSupabase = createAdminClient();

    const hoje = new Date().toISOString().split("T")[0];
    const mesAtual = hoje.slice(0, 7);
    const inicioMes = `${mesAtual}-01`;
    const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString().split("T")[0];
    const anoAtual = new Date().getFullYear();

    const [
      { data: saldoContas },
      { count: aPagarExec },
      { count: aReceberExec },
      { count: vencidosPagarExec },
      { data: pagosNoMesExec },
      { data: recebidosNoMesExec },
      { data: receitasMesExec },
      { data: despesasMesExec },
      { data: receitasAnoExec },
      { data: despesasAnoExec },
    ] = await Promise.all([
      adminSupabase.from("contas").select("saldo_atual").eq("ativo", true),
      adminSupabase.from("lancamentos").select("*", { count: "exact", head: true })
        .eq("tipo", "despesa").eq("status", "pendente"),
      adminSupabase.from("lancamentos").select("*", { count: "exact", head: true })
        .eq("tipo", "receita").eq("status", "pendente"),
      adminSupabase.from("lancamentos").select("*", { count: "exact", head: true })
        .eq("tipo", "despesa").eq("status", "pendente").lt("data_vencimento", hoje),
      adminSupabase.from("lancamentos").select("valor, valor_pago")
        .eq("tipo", "despesa").eq("status", "pago")
        .gte("data_pagamento", inicioMes).lte("data_pagamento", fimMes),
      adminSupabase.from("lancamentos").select("valor, valor_pago")
        .eq("tipo", "receita").eq("status", "pago")
        .gte("data_pagamento", inicioMes).lte("data_pagamento", fimMes),
      adminSupabase.from("lancamentos").select("valor")
        .eq("tipo", "receita").eq("status", "pendente")
        .gte("data_vencimento", inicioMes).lte("data_vencimento", fimMes),
      adminSupabase.from("lancamentos").select("valor")
        .eq("tipo", "despesa").eq("status", "pendente")
        .gte("data_vencimento", inicioMes).lte("data_vencimento", fimMes),
      adminSupabase.from("lancamentos").select("valor, valor_pago, data_pagamento")
        .eq("tipo", "receita").eq("status", "pago")
        .gte("data_pagamento", `${anoAtual}-01-01`).lte("data_pagamento", `${anoAtual}-12-31`),
      adminSupabase.from("lancamentos").select("valor, valor_pago, data_pagamento")
        .eq("tipo", "despesa").eq("status", "pago")
        .gte("data_pagamento", `${anoAtual}-01-01`).lte("data_pagamento", `${anoAtual}-12-31`),
    ]);

    const soma = (arr) => (arr || []).reduce((s, r) => s + (r.valor_pago || r.valor || 0), 0);
    const saldoTotal = (saldoContas || []).reduce((s, c) => s + (c.saldo_atual || 0), 0);

    const porMes = (arr) => {
      const meses = Array(12).fill(0);
      (arr || []).forEach(r => {
        const d = new Date(r.data_pagamento);
        if (!isNaN(d.getTime())) {
          meses[d.getMonth()] += (r.valor_pago || r.valor || 0);
        }
      });
      return meses;
    };

    return NextResponse.json({
      saldo_atual:        saldoTotal,
      a_pagar:            aPagarExec || 0,
      a_receber:          aReceberExec || 0,
      vencidos_pagar:     vencidosPagarExec || 0,
      pago_mes:           soma(pagosNoMesExec),
      recebido_mes:       soma(recebidosNoMesExec),
      a_pagar_mes:        soma(despesasMesExec),
      a_receber_mes:      soma(receitasMesExec),
      saldo_previsto_mes: soma(receitasMesExec) - soma(despesasMesExec),
      saldo_realizado_mes: soma(recebidosNoMesExec) - soma(pagosNoMesExec),
      grafico_receitas:   porMes(receitasAnoExec),
      grafico_despesas:   porMes(despesasAnoExec),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
