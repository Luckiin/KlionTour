"use client";

import { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, Loader2 } from "lucide-react";
import { getAllClients } from "@/lib/services/users";
import { getAllQuotes } from "@/lib/services/quotes";

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    Promise.all([getAllClients(), getAllQuotes()])
      .then(([c, q]) => { setClients(c); setQuotes(q); })
      .catch(console.error)
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-100">Clientes</h1>
        <p className="text-ink-300 text-sm mt-1">{clients.length} clientes cadastrados</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field input-icon text-sm" placeholder="Buscar por nome ou e-mail..." />
        </div>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-ink-400">
          <Users size={48} className="mx-auto mb-3 text-ink-500" />
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const stats = getClientStats(c.id);
            return (
              <div key={c.id} className="card p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-900 text-brand-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-100 truncate">{c.name}</h3>
                    <p className="text-xs text-ink-400">
                      Desde {new Date(c.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-ink-300 mb-4">
                  <div className="flex items-center gap-2"><Mail size={13} className="text-ink-400" /> {c.email}</div>
                  <div className="flex items-center gap-2"><Phone size={13} className="text-ink-400" /> {c.phone || "—"}</div>
                </div>
                <div className="flex gap-3 pt-3 border-t border-dark-50">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-ink-400">Cotações</div>
                    <div className="font-bold text-brand-400">{stats.total}</div>
                  </div>
                  <div className="flex-1 text-center border-l border-dark-50">
                    <div className="text-xs text-ink-400">Total gasto</div>
                    <div className="font-bold text-emerald-400 text-sm">
                      {stats.spent > 0
                        ? `R$ ${stats.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "–"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
