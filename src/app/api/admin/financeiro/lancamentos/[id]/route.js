import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { id }    = params;
    const payload   = await request.json();

    const { data, error } = await supabase
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
    const { id }    = params;

    const { error } = await supabase
      .from("lancamentos")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
