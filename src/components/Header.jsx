"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, FileText, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const navItem = (href, label) => (
    <Link
      href={href}
      className={`link-anim text-sm font-medium transition-colors ${
        pathname === href
          ? "text-brand-500 dark:text-brand-300"
          : "text-brand-900/80 dark:text-white/80 hover:text-brand-500 dark:hover:text-brand-300"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 dark:bg-surface-dark/70 border-b border-surface-border/70 dark:border-surface-dark-border/70 shadow-soft"
          : "bg-white/5 backdrop-blur-md border-b border-white/10"
      }`}
    >
      <div className={`container-x flex items-center justify-between transition-all duration-500 ${scrolled ? "h-14" : "h-16"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-brand-500/10 transition-transform group-hover:scale-110 overflow-hidden">
            <img src="/logo.png" alt="Klion Tour" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg tracking-tight text-brand-900 dark:text-white">
              {APP_NAME}
            </span>
            <span className="text-[10px] tracking-[0.22em] uppercase text-steel-500 dark:text-steel-400 mt-1">
              Fretamento & Turismo
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">


          {user ? (
            <div className="flex items-center gap-5">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 dark:text-brand-300 link-anim"
                >
                  <ShieldCheck size={16} /> Admin
                </Link>
              ) : (
                <Link
                  href="/painel"
                  className={`inline-flex items-center gap-1.5 text-sm font-medium link-anim ${
                    pathname === "/painel"
                      ? "text-brand-500 dark:text-brand-300"
                      : "text-brand-900/80 dark:text-white/80"
                  }`}
                >
                  <LayoutDashboard size={16} /> Meu Painel
                </Link>
              )}

              <Link href="/cotacao" className="btn-primary text-sm px-5 py-2.5">
                <FileText size={15} /> Nova cotação
              </Link>

              <ThemeToggle />

              <div className="flex items-center gap-2 pl-4 border-l border-surface-border dark:border-surface-dark-border">
                <div className="w-9 h-9 rounded-full bg-brand-500/10 dark:bg-brand-300/10 flex items-center justify-center text-brand-500 dark:text-brand-300 font-semibold text-sm border border-brand-500/20 dark:border-brand-300/20">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-brand-900 dark:text-white font-medium hidden lg:inline">
                  {user.name?.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-steel-500 hover:text-red-500 transition p-1"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/auth/entrar"
                className="text-sm font-medium text-brand-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-300 transition px-3 py-2"
              >
                Entrar
              </Link>
              <Link href="/auth/cadastro" className="btn-primary text-sm px-5 py-2.5">
                Cadastrar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-xl border border-surface-border dark:border-surface-dark-border text-brand-900 dark:text-white hover:bg-brand-500/10 dark:hover:bg-brand-300/10 transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "x" : "m"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-surface-border dark:border-surface-dark-border bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl"
          >
            <div className="container-x py-5 flex flex-col gap-1">


              {user ? (
                <>
                  {isAdmin && (
                    <MLink href="/admin" highlight>
                      <ShieldCheck size={16} /> Painel Admin
                    </MLink>
                  )}
                  {!isAdmin && (
                    <MLink href="/painel">
                      <LayoutDashboard size={16} /> Meu Painel
                    </MLink>
                  )}
                  <MLink href="/cotacao" highlight>
                    <FileText size={16} /> Nova cotação
                  </MLink>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-xl text-left flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </>
              ) : (
                <>
                  <MLink href="/auth/entrar">Entrar</MLink>
                  <MLink href="/auth/cadastro" highlight>Cadastrar</MLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MLink({ href, children, highlight = false }) {
  return (
    <Link
      href={href}
      className={`px-4 py-3 text-sm rounded-xl transition flex items-center gap-2 ${
        highlight
          ? "text-white bg-brand-500 hover:bg-brand-600 font-medium"
          : "text-brand-900 dark:text-white hover:bg-brand-500/10 dark:hover:bg-brand-300/10"
      }`}
    >
      {children}
    </Link>
  );
}
