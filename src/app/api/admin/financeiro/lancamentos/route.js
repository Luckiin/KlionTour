import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    // Verificação de autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tipo    = searchParams.get("tipo");
    const status  = searchParams.get("status");
    const mes     = searchParams.get("mes"); // YYYY-MM
    const limit   = Number(searchParams.get("limit")) || 100;
    const offset  = Number(searchParams.get("offset")) || 0;

    let query = supabase
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

    const payload = await request.json();
    
    // Injeta o cliente_id do usuário logado para satisfazer RLS
    const finalPayload = {
      ...payload,
      cliente_id: user.id
    };

    const { data, error } = await supabase
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
