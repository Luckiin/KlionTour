"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Clock, ArrowRight, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMyQuotes } from "@/lib/hooks/useQuotes";
import { useAuth } from "@/context/AuthContext";

export default function UserNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const { quotes, isLoading } = useMyQuotes(user?.id);

  // Filtramos o que requer atenção do cliente
  const notifications = quotes
    .filter(q => ["proposed", "negotiating", "approved"].includes(q.status))
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 5);

  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 rounded-2xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-elevated flex items-center justify-center text-brand-900 dark:text-white hover:bg-brand-500/10 transition-all group"
      >
        <Bell size={18} className="group-hover:rotate-12 transition-transform" />
        {hasNotifications && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-surface-dark-elevated shadow-sm animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-900 dark:text-white uppercase tracking-widest">Suas Viagens</h3>
                <p className="text-[10px] text-steel-500 uppercase mt-0.5 tracking-tighter">Atualizações e propostas</p>
              </div>
              {hasNotifications && (
                <span className="bg-brand-500/10 text-brand-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {notifications.length} nova{notifications.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-steel-500 uppercase tracking-widest">Sincronizando...</p>
                </div>
              ) : !hasNotifications ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 mx-auto mb-4">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-sm text-brand-900 dark:text-white font-medium">Sem pendências</p>
                  <p className="text-xs text-steel-500 mt-1">Aguarde o retorno da nossa equipe para novas propostas.</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {notifications.map((q) => (
                    <Link
                      key={q.id}
                      href={`/minhas-cotacoes?id=${q.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 p-4 hover:bg-brand-500/5 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${
                        q.status === 'proposed' ? 'bg-blue-500/10 text-blue-500' : 
                        q.status === 'negotiating' ? 'bg-purple-500/10 text-purple-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {q.status === 'proposed' ? <AlertCircle size={18} /> : 
                         q.status === 'negotiating' ? <MessageSquare size={18} /> : <CheckCircle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-sm font-bold text-brand-900 dark:text-white truncate">
                            {q.from_city} → {q.to_city}
                          </span>
                          <span className="text-[9px] text-steel-400 font-medium whitespace-nowrap ml-2">
                            {new Date(q.updated_at || q.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-steel-500 dark:text-steel-400 truncate">
                          {q.status === 'proposed' ? 'Recebemos uma nova proposta de valor.' : 
                           q.status === 'negotiating' ? 'Nossa equipe respondeu sua mensagem.' : 'Sua viagem foi aprovada!'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                             <span className="text-xs font-serif font-medium text-brand-600 dark:text-brand-300">
                               {q.total_price ? `R$ ${Number(q.total_price).toLocaleString('pt-BR')}` : '—'}
                             </span>
                          </div>
                          <ArrowRight size={12} className="text-brand-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/minhas-cotacoes"
              onClick={() => setIsOpen(false)}
              className="block p-4 text-center bg-surface-subtle dark:bg-surface-dark-subtle hover:bg-brand-500/10 transition-colors border-t border-surface-border dark:border-surface-dark-border"
            >
              <span className="text-xs font-bold text-brand-600 dark:text-brand-300 uppercase tracking-widest">
                Ver todas as minhas viagens
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
