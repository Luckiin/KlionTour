import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Verificação de autenticação
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

    const { searchParams } = new URL(request.url);
    const tipo    = searchParams.get("tipo");
    const status  = searchParams.get("status");
    const mes     = searchParams.get("mes"); // YYYY-MM
    const limit   = Number(searchParams.get("limit")) || 100;
    const offset  = Number(searchParams.get("offset")) || 0;

    // Usamos o Admin Client para bypassar RLS no GET e ver todos os lançamentos
    const { createAdminClient } = await import("@/lib/supabase-server");
    const adminSupabase = createAdminClient();

    let query = adminSupabase
      .from("lancamentos")
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome), quotes(id,from_city,to_city), users(id,name)", { count: "exact" })
      .order("data_vencimento", { ascending: true })
      .range(offset, offset + limit - 1);

    if (tipo)   query = query.eq("tipo", tipo);
    if (status) query = query.eq("status", status);
    if (mes) {
      const [ano, m] = mes.split("-");
      const fim = new Date(Number(ano), Number(m), 0).toISOString().split("T")[0];
      query = query.gte("data_vencimento", `${mes}-01`).lte("data_vencimento", fim);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({ data, total: count });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Verificação de autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Busca o perfil para verificar o role e obter o ID público
    const { data: profile } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Acesso negado. Apenas administradores." }, { status: 403 });
    }

    const payload = await request.json();
    
    // Prepara o payload final
    const finalPayload = {
      ...payload,
      // Se não vier um cliente_id, associa ao ID público do admin que está criando
      cliente_id: payload.cliente_id || profile.id,
      data_pagamento: payload.data_pagamento || null,
      valor_pago: payload.valor_pago || null,
    };

    // Usamos o Admin Client para bypassar RLS e permitir o insert
    const { createAdminClient } = await import("@/lib/supabase-server");
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("lancamentos")
      .insert(finalPayload)
      .select("*, categorias_financeiras(id,nome,cor), contas(id,nome)")
      .single();
      
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
