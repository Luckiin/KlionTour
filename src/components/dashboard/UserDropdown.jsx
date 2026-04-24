"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isAdmin } = useAuth();
  const settingsPath = isAdmin ? "/admin/configuracoes" : "/configuracoes";
  const roleLabel = isAdmin ? "Administrador" : "Cliente";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border shadow-sm hover:bg-brand-500/5 transition-all group"
      >
        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-serif text-sm shrink-0 shadow-md">
          {user?.name?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="hidden md:flex flex-col items-start leading-tight">
          <span className="text-xs font-bold text-brand-900 dark:text-white truncate max-w-[100px]">
            {user?.name?.split(' ')[0]}
          </span>
          <span className="text-[9px] font-bold text-brand-500 uppercase tracking-tighter flex items-center gap-0.5">
            {roleLabel} <Sparkles size={7} />
          </span>
        </div>
        <ChevronDown size={14} className={`text-steel-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 bg-surface-subtle dark:bg-surface-dark-subtle/50 border-b border-surface-border dark:border-surface-dark-border">
              <p className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mb-1">Conta Conectada</p>
              <p className="text-sm font-bold text-brand-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-steel-500 truncate">{user?.email}</p>
            </div>

            <div className="p-2">
              <Link
                href={settingsPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm text-steel-600 dark:text-steel-400 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
              >
                <User size={16} />
                <span>Meu Perfil</span>
              </Link>
              <Link
                href={settingsPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm text-steel-600 dark:text-steel-400 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
              >
                <Settings size={16} />
                <span>Configurações</span>
              </Link>
            </div>

            <div className="p-2 border-t border-surface-border dark:border-surface-dark-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                <span className="font-bold uppercase text-[11px] tracking-widest">Sair do Sistema</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
