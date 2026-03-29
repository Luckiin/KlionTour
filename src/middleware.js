// ============================================================
// Middleware KlionTour — gerencia sessão Supabase e protege rotas
// ============================================================
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Rotas exclusivas para visitantes NÃO autenticados
const PUBLIC_ONLY = ["/", "/sobre"];
// Rotas exclusivas para usuários autenticados (clientes)
const CLIENT_ROUTES = ["/painel", "/cotacao"];
// Rotas exclusivas para admins
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não coloque lógica entre createServerClient e getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Busca o role do usuário na tabela public.users ─────────
  let role = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .single();
    role = profile?.role ?? "client";
  }

  const isAdmin  = role === "admin";
  const isClient = !!user && !isAdmin;

  // ── Regras de redirect ─────────────────────────────────────

  // 1. Rotas públicas (homepage, sobre): logado → painel
  if (user && PUBLIC_ONLY.some(p => pathname === p)) {
    const dest = isAdmin ? "/admin" : "/painel";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 2. Páginas de auth (entrar, cadastro): logado → painel
  if (user && (pathname.startsWith("/auth/entrar") || pathname.startsWith("/auth/cadastro"))) {
    const dest = isAdmin ? "/admin" : "/painel";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 3. Rotas de cliente: não logado → login
  if (!user && CLIENT_ROUTES.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/entrar", request.url));
  }

  // 4. Rotas de admin: não logado → login | logado sem ser admin → painel
  if (ADMIN_ROUTES.some(p => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/entrar", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/painel", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Ignora arquivos estáticos do Next.js e imagens,
     * mas processa todas as outras rotas.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
