"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, DollarSign, Clock, TrendingUp, CheckCircle,
  AlertCircle, ArrowRight, Loader2, ArrowUpRight, Wallet,
} from "lucide-react";
import { getAllQuotes } from "@/lib/services/quotes";
import { getRevenues, getExpenses } from "@/lib/services/financial";
import { QUOTE_STATUSES } from "@/lib/constants";
import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";

const fmt = (v) =>
  `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function AdminDashboard() {
  const [quotes,   setQuotes]   = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getAllQuotes(), getRevenues(), getExpenses()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue  = revenues.reduce((a, r) => a + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const netProfit     = totalRevenue - totalExpenses;

  const pending  = quotes.filter(q => q.status === "pending");
  const approved = quotes.filter(q => q.status === "approved");
  const done     = quotes.filter(q => q.status === "done" || q.status === "paid");

  const KPI = [
    {
      label: "Cotações pendentes", value: pending.length,
      icon: Clock, accent: "from-brand-300/60 to-brand-500/20",
      href: "/admin/cotacoes", isMoney: false,
    },
    {
      label: "Aprovadas", value: approved.length,
      icon: CheckCircle, accent: "from-brand-500/60 to-brand-700/20",
      href: "/admin/cotacoes", isMoney: false,
    },
    {
      label: "Concluídas", value: done.length,
      icon: FileText, accent: "from-brand-700/60 to-brand-900/30",
      href: "/admin/cotacoes", isMoney: false,
    },
    {
      label: "Receita total", value: totalRevenue,
      icon: DollarSign, accent: "from-emerald-400/40 to-emerald-600/10",
      href: "/admin/financeiro", isMoney: true,
    },
    {
      label: "Despesas", value: totalExpenses,
      icon: TrendingUp, accent: "from-rose-400/40 to-rose-600/10",
      href: "/admin/financeiro", isMoney: true,
    },
    {
      label: "Lucro líquido", value: netProfit,
      icon: Wallet,
      accent: netProfit >= 0 ? "from-brand-300/60 to-brand-500/20" : "from-rose-400/40 to-rose-600/10",
      href: "/admin/financeiro", isMoney: true, negative: netProfit < 0,
    },
  ];

  const recent = [...quotes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ====================== KPIs ====================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <Reveal key={i} direction="up" delay={i * 0.06}>
              <Link
                href={k.href}
                className="group relative block overflow-hidden rounded-3xl border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-elevated p-6 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-500"
              >
                {/* halo colorido */}
                <div className={`pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${k.accent} blur-3xl opacity-70 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-start justify-between relative">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase text-steel-500 dark:text-steel-400">
                      {k.label}
                    </p>
                    <div className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tightest mt-3 ${
                      k.negative ? "text-rose-500" : "text-brand-900 dark:text-white"
                    }`}>
                      {k.isMoney ? (
                        <Counter
                          to={Math.abs(k.value)}
                          formatter={(n) => `${k.negative ? "-" : ""}${fmt(n).replace("R$ ", "R$ ")}`}
                        />
                      ) : (
                        <Counter to={k.value} />
                      )}
                    </div>
                  </div>

                  <span className="w-11 h-11 rounded-2xl bg-brand-500/10 dark:bg-brand-300/10 text-brand-500 dark:text-brand-300 flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </span>
                </div>

                <div className="relative mt-6 flex items-center justify-between text-xs text-steel-500 dark:text-steel-400">
                  <span className="group-hover:text-brand-500 transition">Ver detalhes</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {/* ====================== RECENTES + PENDENTES ====================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recentes */}
        <Reveal className="lg:col-span-2" direction="up" delay={0.05}>
          <div className="card p-7 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="eyebrow">Últimas</span>
                <h2 className="font-serif text-2xl text-brand-900 dark:text-white mt-2">
                  Cotações recentes
                </h2>
              </div>
              <Link
                href="/admin/cotacoes"
                className="text-sm text-brand-500 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-200 inline-flex items-center gap-1 transition"
              >
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-14">
                <FileText size={36} className="mx-auto text-steel-400 mb-3" />
                <p className="text-sm text-steel-500">Nenhuma cotação ainda.</p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {recent.map((q, i) => {
                  const s = QUOTE_STATUSES[q.status] || QUOTE_STATUSES.pending;
                  return (
                    <motion.li
                      key={q.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-brand-500/10 text-brand-500 dark:text-brand-300 flex items-center justify-center shrink-0 font-medium text-sm">
                          {q.user_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-brand-900 dark:text-white truncate">
                              {q.from_city} → {q.to_city}
                            </span>
                            <span className={`badge ${s.color} shrink-0`}>{s.label}</span>
                          </div>
                          <div className="text-xs text-steel-500 dark:text-steel-400 mt-0.5 truncate">
                            {q.user_name} · {new Date(q.date + "T12:00:00").toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif text-base md:text-lg text-brand-900 dark:text-white">
                          {q.total_price ? fmt(q.total_price) : "—"}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </Reveal>

        {/* Ação necessária */}
        <Reveal direction="up" delay={0.15}>
          <div className="card p-7 h-full relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
              <span className="eyebrow">Atenção</span>
              <h2 className="font-serif text-2xl text-brand-900 dark:text-white mt-2 mb-6">
                Ação necessária
              </h2>

              {pending.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={36} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-steel-500">Tudo em dia! Nenhuma pendência.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.slice(0, 3).map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 flex gap-3"
                    >
                      <AlertCircle size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-900 dark:text-white truncate">
                          {q.user_name}
                        </p>
                        <p className="text-xs text-steel-500 dark:text-steel-400 truncate">
                          {q.from_city} → {q.to_city}
                        </p>
                        <p className="text-[11px] text-steel-400 mt-1">
                          {new Date(q.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {pending.length > 3 && (
                    <p className="text-xs text-steel-500 text-center">
                      +{pending.length - 3} pendente{pending.length - 3 !== 1 ? "s" : ""}
                    </p>
                  )}

                  <Link href="/admin/cotacoes" className="btn-primary w-full text-sm mt-2">
                    Gerenciar cotações <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
