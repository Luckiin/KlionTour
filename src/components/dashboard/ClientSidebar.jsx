"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Plus, HelpCircle,
  LogOut, ChevronLeft, X, Sparkles, Settings,
  MapPin, Clock, MessageSquare
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const NAV = [
  { href: "/painel",          icon: LayoutDashboard, label: "Visão Geral",     id: "painel" },
  { href: "/minhas-cotacoes",   icon: FileText,        label: "Minhas Cotações", id: "minhas-cotacoes" },
  { href: "/cotacao",         icon: Plus,            label: "Nova Cotação",    id: "cotacao" },
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
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          bg-white dark:bg-surface-dark-elevated
          border-r border-surface-border dark:border-surface-dark-border
          transition-[width,transform] duration-500 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 ${width}
        `}
      >
        {/* Header da sidebar */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-surface-border dark:border-surface-dark-border relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-gradient opacity-5 pointer-events-none" />
          
          <Link href="/painel" className="flex items-center gap-3 flex-1 min-w-0 relative z-10 group">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/10 group-hover:scale-110 transition-transform overflow-hidden">
              <img src="/logo.png" alt="Klion Tour" className="w-full h-full object-contain" />
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="font-serif text-lg text-brand-900 dark:text-white leading-tight">
                    {APP_NAME}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] tracking-[0.22em] uppercase text-brand-500 font-bold">
                    <Sparkles size={8} /> Painel Cliente
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-steel-500 hover:bg-brand-500/10"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação Principal */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-8 scrollbar-hide">
          <div className="space-y-1">
             {!collapsed && (
               <p className="px-3 mb-2 text-[10px] font-bold text-steel-400 uppercase tracking-[0.2em]">Menu Principal</p>
             )}
             {NAV.map(({ href, icon: Icon, label, id }) => {
               const active = pathname === href;
               return (
                 <SidebarItem 
                   key={id}
                   href={href}
                   icon={Icon}
                   label={label}
                   active={active}
                   collapsed={collapsed}
                   onClick={() => setMobileOpen(false)}
                 />
               );
             })}
          </div>
        </div>

        {/* Toggle Collapse (só desktop) */}
        <div className="p-3 border-t border-surface-border dark:border-surface-dark-border">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex w-full items-center justify-center rounded-xl p-2.5 text-steel-400 hover:text-brand-500 hover:bg-brand-500/5 transition-all"
            aria-label="Recolher menu"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.4 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function SidebarItem({ href, icon: Icon, label, active, collapsed, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
        active
          ? "text-white shadow-soft"
          : "text-steel-600 dark:text-steel-400 hover:bg-brand-500/10 dark:hover:bg-brand-300/10"
      }`}
      title={collapsed ? label : undefined}
    >
      {active && (
        <motion.span
          layoutId="client-sidebar-pill"
          className="absolute inset-0 rounded-2xl bg-brand-gradient shadow-lg shadow-brand-500/20 -z-10"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon size={18} className={`shrink-0 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110 group-hover:text-brand-500"}`} />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {active && !collapsed && (
        <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40"
        />
      )}
    </Link>
  );
}
