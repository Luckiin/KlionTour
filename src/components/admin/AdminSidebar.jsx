"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, DollarSign, Users,
  UserCheck, Bus, LogOut, ChevronLeft, X, Settings,
  ArrowDownCircle, ArrowUpCircle, CalendarRange, TrendingUp, ChevronDown
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const NAV_FINANCEIRO = [
  { href: "/admin/financeiro",                icon: LayoutDashboard, label: "Dashboard"        },
  { href: "/admin/financeiro/contas-pagar",   icon: ArrowDownCircle, label: "Contas a Pagar"   },
  { href: "/admin/financeiro/contas-receber", icon: ArrowUpCircle,   label: "Contas a Receber" },
  { href: "/admin/financeiro/agenda",         icon: CalendarRange,   label: "Agenda"           },
  { href: "/admin/financeiro/extrato",        icon: FileText,        label: "Extrato"          },
  { href: "/admin/financeiro/fluxo-caixa",    icon: TrendingUp,      label: "Fluxo de Caixa"   },
];

const NAV = [
  { href: "/admin",             icon: LayoutDashboard, label: "Visão geral" },
  { href: "/admin/cotacoes",    icon: FileText,         label: "Cotações"    },
  { href: "/admin/financeiro",  icon: DollarSign,       label: "Financeiro"  },
  { href: "/admin/clientes",    icon: Users,            label: "Clientes"    },
  { href: "/admin/motoristas",  icon: UserCheck,        label: "Motoristas"  },
  { href: "/admin/veiculos",    icon: Bus,              label: "Veículos"    },
  { href: "/admin/configuracoes", icon: Settings,       label: "Configurações" },
];

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  user,
  onLogout,
}) {
  const pathname = usePathname();
  const width = collapsed ? "lg:w-[88px]" : "lg:w-72";

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
        animate={{ x: mobileOpen ? 0 : undefined }}
        className={`
          fixed inset-y-0 left-0 z-[60] w-72 flex flex-col
          bg-white dark:bg-surface-dark-elevated
          border-r border-surface-border dark:border-surface-dark-border
          transition-all duration-500 ease-in-out
          ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          lg:translate-x-0 ${width}
        `}
      >
        {/* Header da sidebar */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-surface-border dark:border-surface-dark-border">
          <Link href="/admin" className="flex items-center gap-3 flex-1 min-w-0">
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
                    Admin
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Botão fechar mobile - mais visível e fácil de tocar */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2.5 rounded-xl text-steel-500 hover:bg-brand-500/10 active:scale-95 transition-all"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            // Se for o Financeiro, vamos tratá-lo separadamente para ser colapsável
            if (href === "/admin/financeiro") return null;

            const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-500 text-white shadow-soft"
                    : "text-brand-900 dark:text-white/80 hover:bg-brand-500/10 dark:hover:bg-brand-300/10"
                }`}
                title={collapsed ? label : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="admin-active-pill"
                    className="absolute inset-0 rounded-2xl bg-brand-500 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className="shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          <div className="h-px bg-surface-border dark:bg-surface-dark-border my-2" />

          {/* Menu Financeiro Colapsável - Estilo PrevGestão */}
          <FinanceiroMenu collapsed={collapsed} pathname={pathname} setMobileOpen={setMobileOpen} />
        </nav>

        {/* Rodapé: usuário + toggle collapse */}
        <div className="border-t border-surface-border dark:border-surface-dark-border p-3 space-y-2">
          <div className={`flex items-center gap-3 rounded-2xl p-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 dark:text-brand-300 font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "A"}
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

function FinanceiroMenu({ collapsed, pathname, setMobileOpen }) {
  const [open, setOpen] = useState(pathname.startsWith("/admin/financeiro"));
  
  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
          pathname.startsWith("/admin/financeiro") 
            ? "bg-brand-500 text-white shadow-soft" 
            : "text-brand-900 dark:text-white/80 hover:bg-brand-500/10 dark:hover:bg-brand-300/10"
        )}
      >
        <div className="flex items-center gap-3">
          <DollarSign size={18} className="shrink-0" />
          {!collapsed && <span>Financeiro</span>}
        </div>
        {!collapsed && (
          <ChevronDown size={14} className={cn("transition-transform duration-300", open && "rotate-180")} />
        )}
      </button>

      <AnimatePresence>
        {open && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 space-y-1"
          >
            {NAV_FINANCEIRO.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                    active 
                      ? "bg-brand-500/10 text-brand-500 dark:text-brand-300 font-bold" 
                      : "text-steel-500 dark:text-steel-400 hover:bg-brand-500/10"
                  )}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
