"use client";

import { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, Loader2 } from "lucide-react";
import { getAllClients } from "@/lib/services/users";
import { getAllQuotes } from "@/lib/services/quotes";
import Reveal from "@/components/motion/Reveal";

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    Promise.all([getAllClients(), getAllQuotes()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getClientStats = (userId) => {
    const cq = quotes.filter(q => q.user_id === userId);
    return {
      total: cq.length,
      spent: cq
        .filter(q => ["paid", "done"].includes(q.status))
        .reduce((a, q) => a + Number(q.total_price || 0), 0),
    };
  };

  const filtered = clients.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="mb-8">
        <Reveal direction="down">
          <h1 className="text-3xl font-serif font-medium text-brand-900 dark:text-white">Clientes</h1>
          <p className="text-steel-500 dark:text-steel-400 text-sm mt-1">{clients.length} clientes ativos no sistema</p>
        </Reveal>
      </div>

      <div className="card p-6 mb-8 group">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="input-field input-icon" 
            placeholder="Pesquisar por nome, e-mail ou empresa..." 
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-24 flex flex-col items-center justify-center border-dashed">
          <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
          <p className="text-sm font-bold text-steel-500 uppercase tracking-widest">Carregando Clientes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-24 text-center border-dashed opacity-60">
          <Users size={48} className="mx-auto mb-4 text-steel-300 dark:text-steel-600" />
          <h4 className="font-serif text-2xl text-brand-900 dark:text-white mb-2">Nenhum resultado</h4>
          <p className="text-steel-500 max-w-xs mx-auto">Não encontramos nenhum cliente com o termo "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => {
            const stats = getClientStats(c.id);
            return (
              <Reveal key={c.id} direction="up" delay={i * 0.03}>
                <div className="card p-6 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 flex items-center justify-center font-serif text-xl shrink-0">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-brand-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">{c.name}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-steel-400 mt-1">
                        Deste {new Date(c.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-steel-500 dark:text-steel-400 mb-6 bg-surface-subtle dark:bg-surface-dark-subtle/40 p-4 rounded-2xl border border-surface-border dark:border-surface-dark-border">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={14} className="text-brand-500 shrink-0" /> 
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-brand-500 shrink-0" /> 
                      {c.phone || "Não informado"}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-surface-border dark:border-surface-dark-border">
                    <div className="flex-1">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-steel-400 mb-1">Solicitações</div>
                      <div className="font-serif text-2xl text-brand-900 dark:text-white">{stats.total}</div>
                    </div>
                    <div className="flex-1 pl-4 border-l border-surface-border dark:border-surface-dark-border">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-steel-400 mb-1">Total Gasto</div>
                      <div className="font-serif text-2xl text-emerald-500 tracking-tighter">
                        {stats.spent > 0
                          ? `R$ ${stats.spent.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
