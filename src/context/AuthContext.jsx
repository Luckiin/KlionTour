"use client";

// ============================================================
// AuthContext — Supabase Auth
// Gerencia sessão, login, cadastro e role do usuário
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const supabase = createClient();

  const [user,    setUser]    = useState(null);   // perfil da tabela public.users
  const [session, setSession] = useState(null);   // sessão Supabase Auth
  const [loading, setLoading] = useState(true);

  // ─── Busca perfil na tabela public.users ──────────────────
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) { setUser(null); return; }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUser.id)
      .single();

    setUser(profile ?? null);
  }, [supabase]);

  // ─── Inicialização: lê sessão existente ──────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    // Escuta mudanças de sessão (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchProfile(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Login ────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    
    // Busca imediatamente a role para podermos redirecionar para a tela certa
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", data.user.id)
      .single();
      
    return { ...data.user, role: profile?.role };
  };

  // ─── Cadastro ─────────────────────────────────────────────
  const register = async ({ nomeCompleto, email, senha, celular, documento, isEmpresa, endereco, cidade, cep, estado }) => {
    // 1. Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { name: nomeCompleto }, // metadata para o trigger (opcional)
      },
    });
    if (authError) throw new Error(authError.message);

    const authUser = authData.user;

    // 2. Insere perfil na tabela public.users
    const { error: profileError } = await supabase.from("users").insert({
      auth_id:    authUser.id,
      name:       nomeCompleto,
      email,
      phone:      celular ?? null,
      role:       "client",
      is_empresa: isEmpresa ?? false,
      documento:  documento?.replace(/\D/g, "") ?? null,
      endereco:   endereco ?? null,
      cidade:     cidade   ?? null,
      cep:        cep?.replace(/\D/g, "") ?? null,
      estado:     estado   ?? null,
    });
    if (profileError) throw new Error(profileError.message);

    return authUser;
  };

  // ─── Logout ───────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // ─── Atualiza perfil ─────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user) throw new Error("Não autenticado");
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setUser(data);
    return data;
  };

  const isAdmin  = user?.role === "admin";
  const isClient = user?.role === "client";

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAdmin,
      isClient,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
