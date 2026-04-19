"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Calendar, ChevronRight, Users, Loader2,
  ArrowRight, Wallet, Clock, CheckCircle2, MapPin, Sparkles,
  TrendingUp, LifeBuoy, Search, MoreHorizontal, History
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getMyQuotes } from "@/lib/services/quotes";
import { QUOTE_STATUSES } from "@/lib/constants";
import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";

const fmtBRL = (v) =>
  `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

export default function PainelPage() {
  const { user } = useAuth();
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    getMyQuotes(user.id)
      .then(setQuotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  // --- Processamento de Dados p/ Gráfico ---
  const chartData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const data = months.map((m, i) => ({ month: m, total: 0 }));

    quotes
      .filter(q => ["paid", "done", "approved"].includes(q.status))
      .forEach(q => {
        const d = new Date(q.date);
        if (d.getFullYear() === now.getFullYear()) {
          data[d.getMonth()].total += (q.total_price || 0);
        }
      });
    
    return data.slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1);
  }, [quotes]);

  const stats = {
    total:    quotes.length,
    pending:  quotes.filter(q => q.status === "pending" || q.status === "negotiating" || q.status === "proposed").length,
    approved: quotes.filter(q => ["approved", "paid", "done"].includes(q.status)).length,
    spent:    quotes
      .filter(q => ["paid", "done", "approved"].includes(q.status))
      .reduce((a, q) => a + (q.total_price || 0), 0),
  };

  const filtered = quotes
    .filter(q => filter === "all" ? true : q.status === filter)
    .filter(q => {
      const search = searchTerm.toLowerCase();
      return (q.from_city?.toLowerCase().includes(search) || q.to_city?.toLowerCase().includes(search)) || false;
    });

  const FILTERS = [
    ["all",      "Todas"],
    ["pending",  "Abertas"],
    ["approved", "Aprovadas"],
    ["done",     "Concluídas"],
  ];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      
      {/* 1. HEADER HERO (Apenas saudações) */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <Reveal direction="down">
              <span className="eyebrow !text-brand-500">Klion Dashboard</span>
              <h1 className="font-serif text-4xl md:text-5xl text-brand-900 dark:text-white mt-2">
                Olá, {user?.name?.split(' ')[0]} <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="text-steel-500 text-sm mt-2 max-w-lg">
                Bem-vindo ao seu centro de gestão de fretamento. Acompanhe suas rotas e investimentos em tempo real.
              </p>
           </Reveal>
        </div>
      </section>

      {/* 2. KPI GRID (Refinado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Solicitações" value={stats.total} icon={FileText} color="brand" delay={0} />
        <KPICard label="Em Negociação" value={stats.pending} icon={Clock} color="amber" delay={0.1} />
        <KPICard label="Viagens Confirmadas" value={stats.approved} icon={CheckCircle2} color="emerald" delay={0.2} />
        <KPICard label="Total Investido" value={stats.spent} icon={Wallet} isMoney color="blue" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 3. COLUNA DE ATIVIDADE (8/12) */}
        <section className="lg:col-span-8">
          <div className="card glass p-0 overflow-hidden flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 border-b border-surface-border dark:border-surface-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                  <History size={18} />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-brand-900 dark:text-white">Últimas Cotações</h3>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-surface-subtle dark:bg-surface-dark-subtle rounded-xl border border-surface-border dark:border-surface-dark-border">
                {FILTERS.map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
                      filter === val
                        ? "bg-white dark:bg-surface-dark-elevated text-brand-600 shadow-sm"
                        : "text-steel-400 hover:text-brand-900 dark:hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-4 flex-1">
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center border-dashed border-2 border-surface-border dark:border-surface-dark-border rounded-3xl">
                  <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
                  <p className="text-sm font-bold text-steel-500 uppercase tracking-widest">Carregando...</p>
                </div>
              ) : filtered.length === 0 ? (
                <Reveal direction="up">
                  <div className="p-20 text-center border-dashed border-2 border-surface-border dark:border-surface-dark-border rounded-3xl opacity-60">
                    <div className="w-20 h-20 rounded-3xl bg-brand-500/5 flex items-center justify-center mx-auto mb-6">
                      <Search size={28} className="text-brand-500/40" />
                    </div>
                    <h4 className="font-serif text-2xl text-brand-900 dark:text-white mb-2">Sem resultados</h4>
                    <p className="text-steel-500 text-sm max-w-xs mx-auto">Nenhuma cotação encontrada.</p>
                  </div>
                </Reveal>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((q, i) => (
                    <QuoteRow key={q.id} quote={q} index={i} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>

        {/* 4. COLUNA SIDEBAR (4/12) */}
        <aside className="lg:col-span-4 flex flex-col h-full">
           
           {/* CARD DE GRÁFICO (RECHARTS) */}
           <Reveal direction="left" delay={0.1} className="h-full">
              <div className="card glass p-8 space-y-8 overflow-hidden relative flex flex-col h-full">
                 <div className="flex items-center justify-between">
                    <div>
                       <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-brand-900 dark:text-white">Fluxo de Investimento</h4>
                       <p className="text-[10px] text-steel-500 uppercase tracking-widest font-bold mt-1">Histórico Mensal</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                       <TrendingUp size={18} />
                    </div>
                 </div>

                 <div className="flex-1 min-h-[300px] w-full -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#470002" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#470002" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fontSize: 10, fill: '#94a3b8' }}
                             tickFormatter={(v) => `R$${v/1000}k`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                            formatter={(v) => [fmtBRL(v), 'Gasto']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#470002" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                            animationDuration={2000}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </Reveal>


        </aside>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, isMoney, color, delay }) {
  const colors = {
    brand:    "bg-brand-500/10 text-brand-600 border-brand-500/20",
    amber:    "bg-amber-500/10 text-amber-600 border-amber-500/20",
    emerald:  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    blue:     "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <Reveal direction="up" delay={delay}>
      <div className={`card bg-white dark:bg-surface-dark shadow-sm border ${colors[color]} p-6 md:p-8 flex items-center justify-between group hover:shadow-md transition-all duration-300`}>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-steel-400 mb-2 truncate">
            {label}
          </p>
          <div className="font-serif text-3xl md:text-4xl text-brand-900 dark:text-white leading-none">
            {isMoney ? <Counter to={value} formatter={(n) => fmtBRL(n)} /> : <Counter to={value} />}
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${colors[color].replace('border','bg')}`}>
          <Icon size={24} />
        </div>
      </div>
    </Reveal>
  );
}

function QuoteRow({ quote, index }) {
  const status = QUOTE_STATUSES[quote.status] || QUOTE_STATUSES.pending;
  
  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="card glass border-transparent hover:border-brand-500/20 group cursor-pointer relative overflow-hidden"
    >
      <div className="p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-8 lg:gap-12">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${status.color.replace('badge', 'bg-opacity-10')}`}>
              {status.label}
            </span>
            <div className="text-[9px] font-bold text-steel-400 uppercase tracking-widest bg-surface-subtle dark:bg-surface-dark-subtle px-3 py-1 rounded-full">
              ID #{quote.id.slice(0, 6)}
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12 w-full overflow-hidden">
             <div className="min-w-0 shrink-0">
                <p className="text-[9px] font-bold text-steel-400 uppercase tracking-widest mb-1.5 leading-none">Origem</p>
                <h4 className="font-serif text-xl md:text-2xl text-brand-900 dark:text-white truncate">{quote.from_city}</h4>
             </div>
             
             <div className="flex flex-col items-center gap-1 shrink-0 px-2 opacity-30">
                <div className="h-px w-8 md:w-16 bg-brand-500" />
                <ChevronRight size={14} className="text-brand-500 -mt-2 ml-auto" />
             </div>

             <div className="min-w-0 shrink-0">
                <p className="text-[9px] font-bold text-steel-400 uppercase tracking-widest mb-1.5 leading-none">Destino</p>
                <h4 className="font-serif text-xl md:text-2xl text-brand-500 truncate">{quote.to_city}</h4>
             </div>
          </div>
        </div>

        <div className="flex items-end justify-between xl:flex-col xl:items-end gap-6 xl:pl-12 xl:border-l border-surface-border dark:border-surface-dark-border min-w-[140px]">
           <div className="xl:text-right">
              <p className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mb-1 leading-none">Investimento</p>
              <div className="font-serif text-3xl md:text-4xl text-brand-900 dark:text-white tracking-tighter">
                {quote.total_price || quote.price ? fmtBRL(quote.total_price || quote.price) : "..."}
              </div>
           </div>
           
           <div className="flex items-center gap-4 text-[10px] font-bold text-steel-500 uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-surface-subtle dark:bg-surface-dark-subtle px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-dark-border">
                <Calendar size={12} className="text-brand-500" /> 
                {new Date(quote.date + "T12:00:00").toLocaleDateString("pt-BR", { day: 'numeric', month: 'short' })}
              </span>
              <span className="flex items-center gap-2 bg-surface-subtle dark:bg-surface-dark-subtle px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-dark-border">
                <Users size={12} className="text-brand-500" /> 
                {quote.passengers} pax
              </span>
           </div>
        </div>
      </div>
    </motion.article>
  );
}
