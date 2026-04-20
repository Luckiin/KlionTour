"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, Label as RechartsLabel
} from "recharts";
import {
  DollarSign, TrendingDown, TrendingUp, AlertTriangle, RefreshCw,
  Plus, X, CheckCircle, ChevronDown, Repeat, SplitSquareHorizontal, Info,
  ArrowDownCircle, ArrowUpCircle, List, BarChart2, FileText, Trash2, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceiroDashboard, useLancamentos, useCategorias } from "@/lib/hooks/useFinanceiro";
import AnexoFinanceiro from "@/components/admin/financeiro/AnexoFinanceiro";
import ModalLancamento from "@/components/admin/financeiro/ModalLancamento";
import { maskMoeda, fmtBRL } from "@/lib/utils";

const MESES      = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const fmt        = (v) => fmtBRL(v);
const fmtShort   = (v) => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${(v||0).toFixed(0)}`;

// Cores adaptadas para KlionTour: Vinho (#470002) e tons associados
const CORES        = ["#470002","#10b981","#8b5cf6","#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b","#14b8a6","#ef4444"];

function cn(...c) { return c.filter(Boolean).join(" "); }

// ── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-3 shadow-xl">
      <p className="text-brand-900 dark:text-white font-bold mb-1 text-xs">{payload[0].name}</p>
      <p className="text-brand-500 font-black text-xs">{fmt(payload[0].value)}</p>
    </div>
  );
}

// ── Label central do donut ───────────────────────────────────────────────────
function CenterLabel({ viewBox, total, linha1 }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-steel-500" fontSize="10" fontWeight="700">
        {linha1.toUpperCase()}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-brand-900 dark:fill-white" fontSize="16" fontWeight="900">
        {fmt(total)}
      </text>
    </g>
  );
}


// ── Seção Despesas / Receitas do mês ─────────────────────────────────────────
function SecaoMes({ tipo, lancamentos, loading, onAbrirModal, onRecarregar }) {
  const [viewTab, setViewTab] = useState("grafico");
  const isDespesa   = tipo === "despesa";
  const accentColor = isDespesa ? "#ef4444" : "#10b981";
  const titulo      = isDespesa ? "Despesas" : "Receitas";
  const Icon        = isDespesa ? ArrowDownCircle : ArrowUpCircle;
  const [mesNome, setMesNome] = useState("");
  useEffect(() => {
    setMesNome(MESES_FULL[new Date().getMonth()]);
  }, []);

  const quitados = lancamentos.filter(l => l.status === "pago");
  const totalQuitado = quitados.reduce((s, l) => s + (l.valor_pago || l.valor || 0), 0);

  const dadosPie = (() => {
    const mapa = {};
    quitados.forEach(l => {
      const cat = l.categorias_financeiras?.nome || "Outros";
      mapa[cat] = (mapa[cat] || 0) + (l.valor_pago || l.valor || 0);
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  })();

  const pieData = dadosPie.length > 0 ? dadosPie : [{ name: "_empty", value: 1 }];
  const isEmpty  = dadosPie.length === 0;

  async function toggleStatus(id, statusAtual) {
    const novoStatus = statusAtual === "pago" ? "pendente" : "pago";
    try {
      await fetch(`/api/admin/financeiro/lancamentos/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          status: novoStatus,
          data_pagamento: novoStatus === "pago" ? new Date().toISOString().slice(0,10) : null,
        }),
      });
      toast.success(novoStatus === "pago" ? "Marcado como quitado!" : "Reaberto");
      onRecarregar();
    } catch { toast.error("Erro ao atualizar."); }
  }

  async function excluir(id) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await fetch(`/api/admin/financeiro/lancamentos/${id}`, { method:"DELETE" });
      toast.success("Excluído."); onRecarregar();
    } catch { toast.error("Erro ao excluir."); }
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col min-h-[340px]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border dark:border-surface-dark-border">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: accentColor }} />
          <h3 className="text-xs font-black text-brand-900 dark:text-white uppercase tracking-widest">
            {titulo} de <span className="capitalize">{mesNome || "..."}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {[["detalhe","Lista",List],["grafico","Gráfico",BarChart2]].map(([k,label,TabIcon]) => (
            <button key={k} onClick={() => setViewTab(k)}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                viewTab===k ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" : "text-steel-500 hover:text-brand-900 dark:hover:text-white")}>
              <TabIcon size={12} />{label}
            </button>
          ))}
          <div className="w-px h-4 bg-surface-border dark:bg-surface-dark-border mx-2" />
          <button onClick={onRecarregar} title="Atualizar"
            className="p-2 rounded-xl text-steel-500 hover:text-brand-500 hover:bg-brand-500/10 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => onAbrirModal()} title="Novo lançamento"
            className="p-2 rounded-xl text-steel-500 hover:text-brand-500 hover:bg-brand-500/10 transition-all">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-brand-500" />
        </div>
      ) : viewTab === "grafico" ? (
        <div className="flex flex-col items-center px-6 pt-4 pb-6">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={68} outerRadius={98}
                paddingAngle={isEmpty ? 0 : (dadosPie.length > 1 ? 3 : 0)}
                dataKey="value"
                stroke="transparent"
                startAngle={90} endAngle={-270}
                animationBegin={0}
                animationDuration={600}
              >
                <RechartsLabel content={({ viewBox }) => (
                  <CenterLabel
                    viewBox={viewBox}
                    total={totalQuitado}
                    linha1={mesNome.slice(0,3)}
                  />
                )} position="center" />
                {pieData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={isEmpty ? "rgba(0,0,0,0.05)" : CORES[idx % CORES.length]}
                  />
                ))}
              </Pie>
              {!isEmpty && <CustomTooltip />}
            </PieChart>
          </ResponsiveContainer>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
            {dadosPie.map((d, idx) => (
              <div key={d.name} className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CORES[idx % CORES.length] }} />
                <span className="text-[10px] text-steel-500 font-bold uppercase tracking-widest truncate flex-1">{d.name}</span>
                <span className="text-[10px] text-brand-900 dark:text-white font-black">{fmt(d.value)}</span>
              </div>
            ))}
          </div>

          <div className="w-full mt-6 pt-4 border-t border-surface-border dark:border-surface-dark-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest">
            <div className="flex justify-between">
              <span className="text-steel-400">Quitado</span>
              <span style={{ color: accentColor }}>{fmt(totalQuitado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel-400">Pendente</span>
              <span className="text-brand-900 dark:text-white">
                {fmt(lancamentos.filter(l=>l.status!=="pago").reduce((s,l)=>s+(l.valor||0),0))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {lancamentos.length === 0 ? (
            <button onClick={() => onAbrirModal()}
              className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-steel-400 hover:text-brand-500 transition-colors group">
              <div className="w-10 h-10 rounded-2xl border-2 border-dashed border-current flex items-center justify-center group-hover:border-brand-500/50 transition-colors">
                <Plus size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">+ Adicionar {isDespesa ? "despesa" : "receita"}</span>
            </button>
          ) : (
            <>
              <div className="divide-y divide-surface-border dark:divide-surface-dark-border flex-1">
                {lancamentos.map(l => {
                  const pago = l.status === "pago";
                  return (
                    <div key={l.id} className="flex items-center gap-4 px-6 py-4 hover:bg-brand-500/[0.02] transition-colors group">
                      <button onClick={() => toggleStatus(l.id, l.status)}
                        className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          pago ? "bg-brand-500 border-brand-500 text-white" : "border-surface-border dark:border-surface-dark-border hover:border-brand-500")}>
                        {pago && <CheckCircle size={14} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", pago ? "text-steel-400 line-through" : "text-brand-900 dark:text-white")}>
                          {l.descricao}
                        </p>
                        <p className="text-[10px] text-steel-500 font-bold uppercase tracking-widest">{l.categorias_financeiras?.nome || "Sem categoria"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black" style={{ color: pago ? "inherit" : accentColor }}>
                          {fmt(l.valor_pago || l.valor)}
                        </p>
                        <p className="text-[9px] font-bold text-steel-400 uppercase">
                          {pago ? "Quitado" : `Vence ${new Date(l.data_vencimento).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between bg-surface-subtle/30 dark:bg-surface-dark-subtle/10">
                <button onClick={() => onAbrirModal()}
                   className="text-[10px] font-black uppercase tracking-widest text-steel-500 hover:text-brand-500 transition-colors flex items-center gap-1">
                  <Plus size={12} /> Adicionar novo
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-steel-500">
                  Total: <span className="text-brand-900 dark:text-white">{fmt(lancamentos.reduce((s,l)=>s+(l.valor||0),0))}</span>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard principal ──────────────────────────────────────────────────────
export default function AdminFinanceiroPage() {
  const [modal, setModal]       = useState(null);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const mesISO = useMemo(() => new Date().toISOString().slice(0,7), []);
  const mesAtual = useMemo(() => new Date().toLocaleString("pt-BR", { month:"long", year:"numeric" }), []);

  const { dashboard: d, isLoading: loadDash, mutate: mutDash } = useFinanceiroDashboard();
  const { lancamentos: despesas, isLoading: loadDesp, mutate: mutDesp } = useLancamentos({ tipo: 'despesa', mes: mesISO, limit: 50 });
  const { lancamentos: receitas, isLoading: loadRec, mutate: mutRec } = useLancamentos({ tipo: 'receita', mes: mesISO, limit: 50 });

  const loading = loadDash;
  const lancLoading = loadDesp || loadRec;

  function recarregar() { 
    mutDash(); 
    mutDesp(); 
    mutRec(); 
  }

  const grafico = MESES.map((mes,i) => ({
    mes,
    Receita: d?.grafico_receitas?.[i] || 0,
    Despesa: d?.grafico_despesas?.[i] || 0,
  }));

  if (!mounted || loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-brand-900 dark:text-white flex items-center gap-3">Financeiro</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={32} className="animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-900 dark:text-white flex items-center gap-3">
             Financeiro
          </h1>
          <p className="text-sm text-steel-500 mt-1">Resumo financeiro KlionTour</p>
        </div>
        <button onClick={recarregar} className="p-3 rounded-2xl bg-surface-subtle dark:bg-surface-dark-subtle border border-surface-border dark:border-surface-dark-border text-steel-500 hover:text-brand-900 dark:hover:text-white transition-all">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <>
          {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {[
            { label:"Saldo Atual", value:fmt(d?.saldo_atual),    icon:DollarSign,    color:"#470002", bg:"rgba(71,0,2,0.1)" },
            { label:"A Receber",   value:fmt(d?.a_receber_mes),  icon:TrendingUp,    color:"#10b981", bg:"rgba(16,185,129,0.1)"   },
            { label:"A Pagar",     value:fmt(d?.a_pagar_mes),    icon:TrendingDown,  color:"#ef4444", bg:"rgba(239,68,68,0.1)"   },
            { label:"Vencidos",    value:d?.vencidos_pagar||0,   icon:AlertTriangle, color:"#f59e0b", bg:"rgba(245,158,11,0.1)", suffix:" conta(s)" },
          ].map(c => (
            <div key={c.label} className="glass-card rounded-3xl p-5 md:p-6 flex items-start gap-4 shadow-sm border-surface-border dark:border-surface-dark-border">
              <div style={{ width:48, height:48, borderRadius:16, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <c.icon size={20} style={{ color:c.color }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mb-1">{c.label}</p>
                <p className="text-2xl font-serif font-medium text-brand-900 dark:text-white leading-none">{c.value}{c.suffix||""}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico anual */}
        <div className="glass-card rounded-3xl p-8 border-surface-border dark:border-surface-dark-border shadow-sm">
          <h2 className="text-xs font-black text-brand-900 dark:text-white uppercase tracking-widest mb-8">Fluxo de Caixa em {new Date().getFullYear()}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={grafico} margin={{ top:5, right:10, left:-15, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="mes" tick={{ fill:"#94a3b8", fontSize:10, fontWeight:700 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtShort} tick={{ fill:"#94a3b8", fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:'0.1em', paddingTop:'20px' }} />
              <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={3} dot={{ r:4, fill:"#10b981", strokeWidth:2, stroke:'#fff' }} />
              <Line type="monotone" dataKey="Despesa" stroke="#ef4444" strokeWidth={3} dot={{ r:4, fill:"#ef4444", strokeWidth:2, stroke:'#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo do mês */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { titulo:"Pagamentos",   sub:mesAtual, itens:[
              { l:"À Pagar",   v:fmt(d?.a_pagar_mes),    c:"#ef4444" },
              { l:"Pago",      v:fmt(d?.pago_mes),       c:"#10b981" },
              { l:"Em Atraso", v:d?.vencidos_pagar||0,   c:"#f59e0b", suf:" conta(s)" },
            ]},
            { titulo:"Recebimentos", sub:mesAtual, itens:[
              { l:"À Receber", v:fmt(d?.a_receber_mes),  c:"#ef4444" },
              { l:"Recebido",  v:fmt(d?.recebido_mes),   c:"#10b981" },
              { l:"Em Atraso", v:"—",                    c:"#f59e0b" },
            ]},
            { titulo:"Saldos",       sub:mesAtual, itens:[
              { l:"Realizado",  v:fmt(d?.saldo_realizado_mes), c:"#470002" },
              { l:"Previsto",   v:fmt(d?.saldo_previsto_mes),  c:"#94a3b8" },
            ]},
          ].map(card => (
            <div key={card.titulo} className="glass-card rounded-3xl p-6 border-surface-border dark:border-surface-dark-border shadow-sm">
              <div className="flex items-baseline gap-2 mb-6">
                <h3 className="text-xs font-black text-brand-900 dark:text-white uppercase tracking-widest">{card.titulo}</h3>
                <span className="text-[10px] text-steel-500 capitalize font-bold">{card.sub}</span>
              </div>
              <div className="flex flex-wrap gap-4 md:gap-8">
                {card.itens.map(it => (
                  <div key={it.l}>
                    <p className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mb-1">{it.l}</p>
                    <p className="text-lg font-black" style={{ color:it.c }}>{it.v}{it.suf||""}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SecaoMes tipo="despesa" lancamentos={despesas} loading={lancLoading}
            onAbrirModal={(original) => setModal({ tipo: "despesa", original })} onRecarregar={recarregar} />
          <SecaoMes tipo="receita" lancamentos={receitas} loading={lancLoading}
            onAbrirModal={(original) => setModal({ tipo: "receita", original })} onRecarregar={recarregar} />
        </div>
      </>

      {modal && (
        <ModalLancamento 
          tipo={modal.tipo} 
          original={modal.original} 
          onClose={() => setModal(null)} 
          onSalvo={recarregar} 
        />
      )}
    </div>
  );
}
