"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Plus, User,
  LogOut, ChevronLeft, X, LifeBuoy,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const NAV = [
  { href: "/painel",                icon: LayoutDashboard, label: "Visão geral"    },
  { href: "/painel/cotacoes",       icon: FileText,         label: "Minhas cotações" },
  { href: "/cotacao",               icon: Plus,             label: "Nova cotação"    },
  { href: "/painel/perfil",         icon: User,             label: "Meu perfil"      },
];

export default function ClientSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  user,
  onLogout,
}) {
  const pathname = usePathname();
  const width = collapsed ? "lg:w-[88px]" : "lg:w-72";

  const isActive = (href) => {
    if (href === "/painel") return pathname === "/painel";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Backdrop mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-brand-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          bg-white dark:bg-surface-dark-elevated
          border-r border-surface-border dark:border-surface-dark-border
          transition-[width,transform] duration-500 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 ${width}
        `}
      >
        {/* Header da sidebar */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-surface-border dark:border-surface-dark-border">
          <Link href="/painel" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 flex items-center justify-center shrink-0">
              <span className="font-serif text-white text-lg leading-none">K</span>
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="font-serif text-lg text-brand-900 dark:text-white leading-tight">
                    {APP_NAME}
                  </span>
                  <span className="text-[10px] tracking-[0.22em] uppercase text-steel-500">
                    Meu painel
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* botão fechar mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-steel-500 hover:bg-brand-500/10"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-brand-900 dark:text-white/80 hover:bg-brand-500/10 dark:hover:bg-brand-300/10"
                }`}
                title={collapsed ? label : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="client-active-pill"
                    className="absolute inset-0 rounded-2xl bg-brand-500 shadow-soft -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className="shrink-0 relative" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap relative"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Card de suporte (só expandido) */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="support"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-3 overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-2xl bg-brand-gradient bg-[size:200%_200%] animate-gradient-pan p-4 text-white">
                <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-20 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <LifeBuoy size={14} />
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/80">
                      Precisa de ajuda?
                    </span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed mb-3">
                    Fale com nosso time e tire qualquer dúvida sobre sua viagem.
                  </p>
                  <a
                    href="https://wa.me/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white text-brand-900 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-brand-100 transition"
                  >
                    Falar agora
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé: usuário + toggle collapse */}
        <div className="border-t border-surface-border dark:border-surface-dark-border mt-3 p-3 space-y-2">
          <div className={`flex items-center gap-3 rounded-2xl p-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 dark:text-brand-300 font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "C"}
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="usr"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <div className="text-sm font-medium text-brand-900 dark:text-white truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs text-steel-500 truncate">
                    {user?.email}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-steel-500 hover:text-red-500 hover:bg-red-500/10 transition ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>

          {/* Collapse toggle (só desktop) */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex w-full items-center justify-center rounded-2xl p-2 text-steel-500 hover:bg-brand-500/10 transition"
            aria-label="Recolher menu"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
