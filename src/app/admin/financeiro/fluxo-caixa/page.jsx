"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ChevronLeft, ChevronRight, RefreshCw, BarChart2, PieChart as PieChartIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useFluxoCaixa } from "@/lib/hooks/useFinanceiro";
import { fmtBRL, cn } from "@/lib/utils";

const fmtK  = (v) => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${(v||0).toFixed(0)}`;

export default function FluxoCaixa() {
  const [mounted, setMounted] = useState(false);
  const [ano, setAno] = useState(new Date().getFullYear());
  
  useEffect(() => { setMounted(true); }, []);

  const { dados, isLoading, mutate } = useFluxoCaixa(ano);

  const totalRecReal  = dados.reduce((s, m) => s + m.recReal, 0);
  const totalDespReal = dados.reduce((s, m) => s + m.despReal, 0);
  const saldoAnual    = totalRecReal - totalDespReal;

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-500" /> Fluxo de Caixa
          </h1>
          <p className="text-sm text-steel-500 mt-1">Análise anual comparativa de receitas e despesas</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-subtle dark:bg-surface-dark-subtle p-1.5 rounded-2xl border border-surface-border dark:border-surface-dark-border">
          <button onClick={() => setAno(a => a - 1)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-surface-dark Transition-all text-steel-400"><ChevronLeft size={16} /></button>
          <span className="text-sm font-black text-brand-900 dark:text-white min-w-[60px] text-center">{ano}</span>
          <button onClick={() => setAno(a => a + 1)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-surface-dark transition-all text-steel-400"><ChevronRight size={16} /></button>
          <div className="w-px h-4 bg-surface-border dark:bg-surface-dark-border mx-1" />
          <button onClick={() => mutate()} className="p-2 rounded-xl hover:bg-white Transition-all text-steel-500">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPIs de Performance Anual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { l: "Receita Realizada", v: fmtBRL(totalRecReal),  c: "text-emerald-500", icon: ArrowUpCircle, bg: "bg-emerald-500/5" },
          { l: "Despesa Realizada", v: fmtBRL(totalDespReal), c: "text-red-500", icon: ArrowDownCircle, bg: "bg-red-500/5" },
          { l: "Resultado do Exercício", v: fmtBRL(saldoAnual), c: saldoAnual >= 0 ? "text-emerald-500" : "text-red-500", icon: BarChart2, bg: "bg-surface-subtle" },
        ].map(k => (
          <div key={k.l} className={cn("glass-card border-none rounded-[2rem] p-8 flex flex-col justify-center", k.bg)}>
            <p className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2">{k.l}</p>
            <p className={cn("text-3xl font-serif font-medium", k.c)}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Área Gráfica Principal */}
      <div className="glass-card rounded-[2.5rem] p-8 space-y-8">
        <h2 className="text-xs font-black text-brand-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <PieChartIcon size={14} className="text-brand-500" /> Fluxo de Caixa Mensal — {ano}
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <RefreshCw size={32} className="animate-spin text-brand-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={dados} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
              <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#fff", border: "none", borderRadius: "1.5rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", padding: "1.5rem" }}
                labelStyle={{ fontWeight: "bold", color: "#1e293b", marginBottom: "0.5rem" }}
              />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "2rem" }} />
              <Area type="monotone" dataKey="recReal" name="Receitas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
              <Area type="monotone" dataKey="despReal" name="Despesas" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDesp)" />
              <Line type="monotone" dataKey="saldoReal" name="Saldo" stroke="#4675c0" strokeWidth={3} dot={{ r: 4, fill: "#4675c0" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Relatório Mensal Detalhado */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/30 dark:bg-surface-dark-subtle/10 border-b border-surface-border dark:border-surface-dark-border">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-steel-500">Período</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-emerald-500 text-right">Rec. Previsto</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-emerald-500 text-right">Rec. Realizado</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-red-500 text-right">Desp. Prevista</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-red-500 text-right">Desp. Realizada</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-brand-900 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {dados.map(m => (
                <tr key={m.mes} className="table-row-hover transition-colors">
                  <td className="p-6 text-sm font-bold text-brand-900 dark:text-white uppercase tracking-tighter">{m.nomeMes}</td>
                  <td className="p-6 text-right font-mono text-[11px] text-emerald-600/50">{fmtBRL(m.recPrevisto)}</td>
                  <td className="p-6 text-right font-mono text-xs font-black text-emerald-600">{fmtBRL(m.recReal)}</td>
                  <td className="p-6 text-right font-mono text-[11px] text-red-600/50">{fmtBRL(m.despPrevisto)}</td>
                  <td className="p-6 text-right font-mono text-xs font-black text-red-600">{fmtBRL(m.despReal)}</td>
                  <td className={cn("p-6 text-right font-mono text-xs font-black", m.saldoReal >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {fmtBRL(m.saldoReal)}
                  </td>
                </tr>
              ))}
              <tr className="bg-brand-900/5 dark:bg-white/5 font-black">
                <td className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-900 dark:text-white">Total Acumulado</td>
                <td className="p-6 text-right font-mono text-xs text-emerald-600/50">—</td>
                <td className="p-6 text-right font-mono text-sm text-emerald-600">{fmtBRL(totalRecReal)}</td>
                <td className="p-6 text-right font-mono text-xs text-red-600/50">—</td>
                <td className="p-6 text-right font-mono text-sm text-red-600">{fmtBRL(totalDespReal)}</td>
                <td className={cn("p-6 text-right font-mono text-sm", saldoAnual >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {fmtBRL(saldoAnual)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ArrowUpCircle(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>; }
function ArrowDownCircle(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>; }
