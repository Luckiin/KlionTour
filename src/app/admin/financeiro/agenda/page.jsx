"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarRange, RefreshCw } from "lucide-react";
import { useLancamentos } from "@/lib/hooks/useFinanceiro";
import { fmtBRL, cn } from "@/lib/utils";

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function AgendaFinanceiro() {
  const [mounted, setMounted] = useState(false);
  const [ano,  setAno]  = useState(new Date().getFullYear());
  const [mes,  setMes]  = useState(new Date().getMonth());
  
  useEffect(() => { setMounted(true); }, []);

  const mesStr = useMemo(() => `${ano}-${String(mes + 1).padStart(2, "0")}`, [ano, mes]);
  const { lancamentos, isLoading, mutate } = useLancamentos({ mes: mesStr, limit: 500 });

  const navMes = (dir) => {
    let m = mes + dir, a = ano;
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    setMes(m); setAno(a);
  };

  // Dias do calendário
  const primeiroDia = useMemo(() => new Date(ano, mes, 1).getDay(), [ano, mes]);
  const diasNoMes   = useMemo(() => new Date(ano, mes + 1, 0).getDate(), [ano, mes]);
  
  const cells = useMemo(() => {
    const c = [];
    for (let i = 0; i < primeiroDia; i++) c.push(null);
    for (let d = 1; d <= diasNoMes; d++) c.push(d);
    return c;
  }, [primeiroDia, diasNoMes]);

  // Lançamentos por dia
  const porDia = useMemo(() => {
    const mapa = {};
    lancamentos.forEach(l => {
      const d = new Date(l.data_vencimento + "T12:00:00").getDate();
      if (!mapa[d]) mapa[d] = [];
      mapa[d].push(l);
    });
    return mapa;
  }, [lancamentos]);

  const totalAPagar    = lancamentos.filter(l => l.tipo === "despesa" && l.status === "pendente").reduce((s, l) => s + (l.valor || 0), 0);
  const totalAReceber  = lancamentos.filter(l => l.tipo === "receita" && l.status === "pendente").reduce((s, l) => s + (l.valor || 0), 0);
  const totalPago      = lancamentos.filter(l => l.tipo === "despesa" && l.status === "pago").reduce((s, l) => s + (l.valor_pago || l.valor || 0), 0);
  const totalRecebido  = lancamentos.filter(l => l.tipo === "receita" && l.status === "pago").reduce((s, l) => s + (l.valor_pago || l.valor || 0), 0);

  if (!mounted) return null;

  const hoje = new Date();
  const hojeD = hoje.getDate(), hojeM = hoje.getMonth(), hojeA = hoje.getFullYear();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-900 dark:text-white flex items-center gap-2">
          <CalendarRange size={20} className="text-brand-500" /> Agenda Financeira
        </h1>
        <button onClick={() => mutate()} className="p-2 rounded-xl text-steel-500 hover:text-brand-900 Transition-all">
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Sumário */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "A Pagar",    value: fmtBRL(totalAPagar),   c: "text-red-500", bg: "bg-red-500/5"    },
          { label: "A Receber",  value: fmtBRL(totalAReceber), c: "text-emerald-500", bg: "bg-emerald-500/5"    },
          { label: "Pago",       value: fmtBRL(totalPago),     c: "text-steel-400", bg: "bg-surface-subtle"  },
          { label: "Recebido",   value: fmtBRL(totalRecebido), c: "text-steel-400", bg: "bg-surface-subtle"  },
        ].map(c => (
          <div key={c.label} className={cn("glass-card border-none rounded-2xl p-5", c.bg)}>
            <p className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mb-1">{c.label}</p>
            <p className={cn("text-lg font-black", c.c)}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-surface-border dark:border-surface-dark-border">
          <div className="flex items-center gap-4">
            <button onClick={() => navMes(-1)} className="p-2 rounded-xl hover:bg-surface-subtle Transition-all"><ChevronLeft size={18} /></button>
            <span className="text-base font-black text-brand-900 dark:text-white min-w-[200px] text-center uppercase tracking-widest">{MESES_PT[mes]} {ano}</span>
            <button onClick={() => navMes(1)} className="p-2 rounded-xl hover:bg-surface-subtle Transition-all"><ChevronRight size={18} /></button>
          </div>
          <button onClick={() => { setMes(new Date().getMonth()); setAno(new Date().getFullYear()); }}
            className="px-6 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500 text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all">
            Ir para hoje
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-surface-border dark:border-surface-dark-border">
          {SEMANA.map(s => (
            <div key={s} className="p-4 text-center text-[10px] font-black text-steel-400 uppercase tracking-widest">{s}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((dia, i) => {
            const isHoje = dia && dia === hojeD && mes === hojeM && ano === hojeA;
            const eventos = dia ? (porDia[dia] || []) : [];
            return (
              <div key={i} className={cn(
                "min-h-[120px] p-2 border-r border-b border-surface-border dark:border-surface-dark-border group transition-all",
                isHoje ? "bg-brand-500/[0.03]" : "hover:bg-surface-subtle/30"
              )}>
                {dia && (
                  <>
                    <div className={cn("text-xs font-black p-2 rounded-lg inline-block float-right", isHoje ? "bg-brand-500 text-white shadow-lg" : "text-steel-400 group-hover:text-brand-900")}>
                      {dia}
                    </div>
                    <div className="clear-both space-y-1 pt-2">
                      {eventos.slice(0, 4).map(ev => (
                        <div key={ev.id} className={cn(
                          "text-[9px] font-black uppercase tracking-tighter px-2 py-1.5 rounded-lg border shadow-sm truncate",
                          ev.tipo === "receita" 
                            ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" 
                            : "bg-red-500/5 text-red-600 border-red-500/10"
                        )}>
                          {ev.descricao}
                        </div>
                      ))}
                      {eventos.length > 4 && <div className="text-[9px] font-bold text-steel-400 pl-1 mt-1">+{eventos.length - 4} lançamentos</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
