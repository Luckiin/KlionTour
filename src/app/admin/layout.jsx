"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Menu, Search, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ThemeToggle from "@/components/ThemeToggle";

const TITLES = {
  "/admin":             { label: "Visão geral",  eyebrow: "Dashboard" },
  "/admin/cotacoes":    { label: "Cotações",     eyebrow: "Operação"  },
  "/admin/financeiro":  { label: "Financeiro",   eyebrow: "Números"   },
  "/admin/clientes":    { label: "Clientes",     eyebrow: "Pessoas"   },
  "/admin/motoristas":  { label: "Motoristas",   eyebrow: "Equipe"    },
  "/admin/veiculos":    { label: "Veículos",     eyebrow: "Frota"     },
};

export default function AdminLayout({ children }) {
  const { user, logout, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/auth/entrar");
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="text-center">
          <ShieldAlert size={44} className="mx-auto mb-3 text-steel-500" />
          <p className="text-steel-500 text-sm">Verificando permissões…</p>
        </div>
      </div>
    );
  }

  const title = TITLES[pathname] || { label: "Admin", eyebrow: "KlionTour" };
  const contentOffset = collapsed ? "lg:pl-[88px]" : "lg:pl-72";

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-brand-900 dark:text-white">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        user={user}
        onLogout={handleLogout}
      />

      <div className={`transition-all duration-500 ${contentOffset}`}>
        {/* Topbar sticky */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-surface/75 dark:bg-surface-dark/75 border-b border-surface-border dark:border-surface-dark-border">
          <div className="h-20 px-5 md:px-8 flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-surface-border dark:border-surface-dark-border text-brand-900 dark:text-white hover:bg-brand-500/10 transition"
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.22em] uppercase text-steel-500 dark:text-steel-400">
                {title.eyebrow}
              </div>
              <h1 className="font-serif text-xl md:text-2xl text-brand-900 dark:text-white leading-tight truncate">
                {title.label}
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 h-11 rounded-full bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border w-72 focus-within:ring-4 focus-within:ring-brand-500/15 transition">
              <Search size={14} className="text-steel-500" />
              <input
                type="text"
                placeholder="Buscar…"
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-steel-500 text-brand-900 dark:text-white"
              />
              <kbd className="hidden lg:inline text-[10px] text-steel-500 border border-surface-border dark:border-surface-dark-border rounded px-1.5 py-0.5">
                /
              </kbd>
            </div>

            <button className="relative w-10 h-10 rounded-full border border-surface-border dark:border-surface-dark-border bg-white/70 dark:bg-surface-dark-elevated/70 flex items-center justify-center text-brand-900 dark:text-white hover:bg-brand-500/10 transition">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />
            </button>

            <ThemeToggle />
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="px-5 md:px-8 py-8 md:py-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
