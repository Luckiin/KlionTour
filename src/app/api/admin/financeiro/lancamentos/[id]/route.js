import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verifica se é admin
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id }    = params;
    const payload   = await request.json();

    const { createAdminClient } = await import("@/lib/supabase-server");
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("lancamentos")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verifica se é admin
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id }    = params;

    const { createAdminClient } = await import("@/lib/supabase-server");
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("lancamentos")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
