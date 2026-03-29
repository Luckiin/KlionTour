"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Calendar, ChevronRight, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyQuotes } from "@/lib/services/quotes";
import { QUOTE_STATUSES } from "@/lib/constants";

export default function PainelPage() {
  const { user } = useAuth();
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    if (!user?.id) return;
    getMyQuotes(user.id)
      .then(setQuotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const stats = {
    total:    quotes.length,
    pending:  quotes.filter(q => q.status === "pending").length,
    approved: quotes.filter(q => ["approved", "paid", "done"].includes(q.status)).length,
    spent:    quotes
      .filter(q => ["paid", "done"].includes(q.status))
      .reduce((a, q) => a + (q.total_price || 0), 0),
  };

  const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter);

  return (
    <div className="bg-dark-300 min-h-screen">
      {/* Topo */}
      <div className="bg-dark-200 border-b border-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-900 flex items-center justify-center text-brand-400 font-bold text-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink-100">
                  Olá, {user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-ink-300 text-sm">Gerencie suas cotações e viagens</p>
              </div>
            </div>
            <Link href="/cotacao" className="btn-primary w-fit">
              <Plus size={16} /> Nova Cotação
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de cotações", value: stats.total,    color: "text-ink-100" },
            { label: "Aguardando",        value: stats.pending,  color: "text-yellow-400" },
            { label: "Aprovadas",         value: stats.approved, color: "text-green-400" },
            { label: "Total investido",
              value: `R$ ${stats.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              color: "text-brand-400" },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <div className="text-xs text-ink-300 mb-1">{s.label}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Meus dados */}
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-ink-100 mb-4">Meus Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div><span className="text-ink-400">Nome: </span><span className="text-ink-100 font-medium">{user?.name}</span></div>
            <div><span className="text-ink-400">E-mail: </span><span className="text-ink-100 font-medium">{user?.email}</span></div>
            <div><span className="text-ink-400">Telefone: </span><span className="text-ink-100 font-medium">{user?.phone || "—"}</span></div>
          </div>
        </div>

        {/* Cotações */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-ink-100 text-lg">Minhas Cotações</h2>
          <div className="flex gap-1 bg-dark-400 rounded-xl p-1">
            {[["all","Todas"],["pending","Aguardando"],["approved","Aprovadas"],["done","Concluídas"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  filter === val ? "bg-dark-200 shadow text-ink-100" : "text-ink-400 hover:text-ink-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card p-16 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <FileText size={52} className="text-ink-400 mx-auto mb-4" />
            <h3 className="font-semibold text-ink-100 mb-2">
              {filter === "all" ? "Nenhuma cotação ainda" : "Nenhuma cotação neste status"}
            </h3>
            <p className="text-ink-400 text-sm mb-6">
              {filter === "all" ? "Solicite sua primeira cotação e ela aparecerá aqui." : "Tente outro filtro."}
            </p>
            {filter === "all" && (
              <Link href="/cotacao" className="btn-primary w-fit mx-auto">Solicitar Cotação</Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => {
              const status = QUOTE_STATUSES[q.status] || QUOTE_STATUSES.pending;
              return (
                <div key={q.id} className="card p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-ink-100">{q.from_city}</span>
                        <ChevronRight size={14} className="text-ink-400" />
                        <span className="font-semibold text-ink-100">{q.to_city}</span>
                        <span className={`badge ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-ink-300 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {new Date(q.date + "T12:00:00").toLocaleDateString("pt-BR")}
                          {q.return_date && ` → ${new Date(q.return_date + "T12:00:00").toLocaleDateString("pt-BR")}`}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={13} /> {q.passengers} passageiros
                        </span>
                        <span>{q.van_name}</span>
                      </div>
                      {q.admin_notes && (
                        <p className="text-sm text-brand-400 mt-1.5 bg-brand-900/30 rounded px-2 py-1">
                          💬 KlionTour: {q.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="md:text-right flex-shrink-0">
                      <div className="text-xs text-ink-400">Valor estimado</div>
                      <div className="text-xl font-extrabold text-brand-400">
                        {q.total_price
                          ? `R$ ${Number(q.total_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </div>
                      <div className="text-xs text-ink-400">
                        Solicitado em {new Date(q.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
