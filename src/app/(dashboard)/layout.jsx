"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import ThemeToggle from "@/components/ThemeToggle";

const TITLES = {
  "/painel":          { label: "Visão Geral",     eyebrow: "Painel de Controle" },
  "/minhas-cotacoes": { label: "Minhas Cotações", eyebrow: "Gestão de Viagens"  },
  "/cotacao":         { label: "Nova Cotação",    eyebrow: "Simulador de Rota"  },
  "/configuracoes":   { label: "Minha Conta",     eyebrow: "Configurações"      },
};

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/entrar");
    }
  }, [user, loading, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-steel-500 text-xs font-bold uppercase tracking-widest">Sincronizando...</p>
        </div>
      </div>
    );
  }

  const title = TITLES[pathname] || { label: "Dashboard", eyebrow: "KlionTour" };
  const contentOffset = collapsed ? "lg:pl-[88px]" : "lg:pl-72";

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-brand-900 dark:text-white transition-colors duration-500">
      <ClientSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        user={user}
        onLogout={handleLogout}
      />

      <div className={`transition-all duration-500 ease-in-out ${contentOffset}`}>
        {/* Topbar Premium */}
        <header className="sticky top-0 z-30 flex items-center h-20 px-5 md:px-10 backdrop-blur-xl bg-surface/70 dark:bg-surface-dark/70 border-b border-surface-border dark:border-surface-dark-border">
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border text-brand-900 dark:text-white shadow-sm"
            >
              <Menu size={18} />
            </button>

            <div className="flex-1 min-w-0">
               <motion.div 
                 key={pathname + "-title"}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex flex-col"
               >
                 <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-500 mb-0.5">
                   {title.eyebrow}
                 </span>
                 <h1 className="font-serif text-2xl md:text-3xl text-brand-900 dark:text-white leading-none tracking-tightest">
                   {title.label}
                 </h1>
               </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Glass */}
            <div className="hidden md:flex items-center gap-3 px-4 h-11 rounded-2xl bg-white dark:bg-surface-dark-elevated/50 border border-surface-border dark:border-surface-dark-border focus-within:ring-4 focus-within:ring-brand-500/10 transition-all group w-64 lg:w-80">
              <Search size={14} className="text-steel-400 group-focus-within:text-brand-500" />
              <input
                type="text"
                placeholder="Buscar em cotações..."
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-steel-500 text-brand-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="relative w-11 h-11 rounded-2xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-elevated flex items-center justify-center text-brand-900 dark:text-white hover:bg-brand-500/10 transition-all group">
                <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-500 animate-pulse border-2 border-white dark:border-surface-dark-elevated" />
              </button>
              <ThemeToggle />
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-surface-border dark:border-surface-dark-border ml-2">
               <div className="flex flex-col items-end leading-none">
                 <span className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mb-1">Status</span>
                 <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                   ONLINE <Sparkles size={8} />
                 </span>
               </div>
            </div>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 md:p-8 lg:p-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
