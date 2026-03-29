"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, DollarSign, Clock, TrendingUp, CheckCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { getAllQuotes } from "@/lib/services/quotes";
import { getRevenues, getExpenses } from "@/lib/services/financial";
import { QUOTE_STATUSES } from "@/lib/constants";

export default function AdminDashboard() {
  const [quotes,   setQuotes]   = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getAllQuotes(), getRevenues(), getExpenses()])
      .then(([q, r, e]) => { setQuotes(q); setRevenues(r); setExpenses(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue  = revenues.reduce((a, r) => a + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const netProfit     = totalRevenue - totalExpenses;

  const pending  = quotes.filter(q => q.status === "pending");
  const approved = quotes.filter(q => q.status === "approved");
  const done     = quotes.filter(q => q.status === "done" || q.status === "paid");

  const fmt = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const KPI = [
    { label: "Cotações Pendentes", value: pending.length,   icon: <Clock size={20} />,        color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800/40", href: "/admin/cotacoes"  },
    { label: "Aprovadas",          value: approved.length,  icon: <CheckCircle size={20} />,  color: "text-green-400",  bg: "bg-green-900/20 border-green-800/40",   href: "/admin/cotacoes"  },
    { label: "Concluídas",         value: done.length,      icon: <FileText size={20} />,     color: "text-brand-400",  bg: "bg-brand-900/30 border-brand-800/40",   href: "/admin/cotacoes"  },
    { label: "Receita Total",      value: fmt(totalRevenue), icon: <DollarSign size={20} />,  color: "text-emerald-400",bg: "bg-emerald-900/20 border-emerald-800/40",href: "/admin/financeiro"},
    { label: "Despesas",           value: fmt(totalExpenses),icon: <TrendingUp size={20} />, color: "text-red-400",    bg: "bg-red-900/20 border-red-800/40",       href: "/admin/financeiro"},
    { label: "Lucro Líquido",      value: fmt(netProfit),   icon: <TrendingUp size={20} />,   color: netProfit >= 0 ? "text-emerald-400" : "text-red-400", bg: netProfit >= 0 ? "bg-emerald-900/20 border-emerald-800/40" : "bg-red-900/20 border-red-800/40", href: "/admin/financeiro"},
  ];

  const recent = [...quotes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={36} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-100">Visão Geral</h1>
        <p className="text-ink-300 text-sm mt-1">Resumo do desempenho da KlionTour</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {KPI.map((k, i) => (
          <Link key={i} href={k.href}
            className={`card p-5 border flex items-center gap-4 hover:shadow-md transition ${k.bg}`}>
            <div className={`p-2.5 rounded-xl bg-dark-300 ${k.color}`}>{k.icon}</div>
            <div>
              <div className="text-xs text-ink-300">{k.label}</div>
              <div className={`text-2xl font-extrabold ${k.color}`}>{k.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cotações recentes */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-ink-100">Cotações Recentes</h2>
            <Link href="/admin/cotacoes" className="text-sm text-brand-400 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-ink-400 text-sm text-center py-8">Nenhuma cotação ainda</p>
          ) : (
            <div className="space-y-0">
              {recent.map(q => {
                const s = QUOTE_STATUSES[q.status] || QUOTE_STATUSES.pending;
                return (
                  <div key={q.id} className="flex items-center justify-between py-3 border-b border-dark-50 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-ink-100">{q.from_city} → {q.to_city}</span>
                        <span className={`badge ${s.color} text-xs`}>{s.label}</span>
                      </div>
                      <div className="text-xs text-ink-400">
                        {q.user_name} · {new Date(q.date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-brand-400">
                        {q.total_price ? fmt(q.total_price) : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ação necessária */}
        <div className="card p-6">
          <h2 className="font-bold text-ink-100 mb-4">Ação Necessária</h2>
          {pending.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-ink-300">Nenhuma cotação pendente!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 3).map(q => (
                <div key={q.id} className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-ink-100">{q.user_name}</p>
                      <p className="text-xs text-ink-300">{q.from_city} → {q.to_city}</p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {new Date(q.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {pending.length > 3 && (
                <p className="text-xs text-ink-400 text-center">+{pending.length - 3} pendente{pending.length - 3 !== 1 ? "s" : ""}</p>
              )}
              <Link href="/admin/cotacoes" className="btn-primary w-full text-sm py-2 mt-1">
                Gerenciar Cotações
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
