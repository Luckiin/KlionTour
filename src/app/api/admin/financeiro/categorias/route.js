import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const tipo = searchParams.get("tipo");
    
    let query = supabase
      .from("categorias_financeiras")
      .select("*")
      .eq("ativo", true);

    if (tipo) {
      query = query.ilike("tipo", tipo.trim());
    }

    const { data, error } = await query.order("nome");

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
