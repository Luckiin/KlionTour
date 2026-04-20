"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, RefreshCw, CheckCircle, Search, Download, Filter, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useMovimentacoes } from "@/lib/hooks/useFinanceiro";
import { toast } from "sonner";
import { fmtBRL, cn } from "@/lib/utils";

export default function Extrato() {
  const [mounted, setMounted] = useState(false);
  
  // Inicialização estável
  const [inicio,  setInicio]  = useState("");
  const [fim,     setFim]     = useState("");
  const [busca,   setBusca]   = useState("");

  useEffect(() => {
    const hoje = new Date();
    const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
    const fimDefault    = hoje.toISOString().split("T")[0];
    setInicio(inicioDefault);
    setFim(fimDefault);
    setMounted(true);
  }, []);

  const { movimentacoes, isLoading, mutate } = useMovimentacoes({
    data_inicio: inicio || undefined,
    data_fim: fim || undefined,
    limit: 1000
  });

  async function conciliar(id, valorAtual) {
    try {
      const res = await fetch(`/api/admin/financeiro/lancamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: valorAtual === 'pago' ? 'pendente' : 'pago' })
      });
      if (!res.ok) throw new Error();
      toast.success(valorAtual === 'pago' ? "Lançamento reaberto" : "Lançamento conciliado");
      mutate();
    } catch {
      toast.error("Erro ao conciliar");
    }
  }

  const filtrados = useMemo(() => {
    return movimentacoes.filter(m => 
      m.descricao.toLowerCase().includes(busca.toLowerCase())
    );
  }, [movimentacoes, busca]);

  const totalEntrada  = filtrados.filter(m => m.tipo === "receita").reduce((s, m) => s + (m.valor || 0), 0);
  const totalSaida    = filtrados.filter(m => m.tipo === "despesa").reduce((s, m) => s + (m.valor || 0), 0);
  const saldoPeriodo  = totalEntrada - totalSaida;

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-brand-500" /> Extrato e Conciliação
          </h1>
          <p className="text-sm text-steel-500 mt-1">Histórico completo de movimentações financeiras</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => mutate()} className="p-3 rounded-2xl bg-surface-subtle dark:bg-surface-dark-subtle border border-surface-border dark:border-surface-dark-border text-steel-500 hover:text-brand-900 transition-all">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button className="btn-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-500/20">
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-[2rem] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2 block ml-1">Data Início</label>
          <input type="date" className="input-field" value={inicio} onChange={e => setInicio(e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2 block ml-1">Data Fim</label>
          <input type="date" className="input-field" value={fim} onChange={e => setFim(e.target.value)} />
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-[3.25rem] -translate-y-1/2 text-steel-400" />
          <label className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2 block ml-1">Buscar</label>
          <input type="text" className="input-field pl-12" placeholder="Palavra-chave..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Entradas", v: fmtBRL(totalEntrada),  c: "text-emerald-500", bg: "bg-emerald-500/5" },
          { l: "Saídas",   v: fmtBRL(totalSaida),    c: "text-red-500", bg: "bg-red-500/5" },
          { l: "Saldo Período", v: fmtBRL(saldoPeriodo),  c: saldoPeriodo >= 0 ? "text-emerald-500" : "text-red-500", bg: "bg-surface-subtle" },
          { l: "Registros", v: filtrados.length, c: "text-neutral-500", bg: "bg-surface-subtle" },
        ].map(c => (
          <div key={c.l} className={cn("glass-card border-none rounded-2xl p-5 flex flex-col justify-center", c.bg)}>
            <p className="text-[10px] font-bold text-steel-500 uppercase tracking-widest mb-1">{c.l}</p>
            <p className={cn("text-2xl font-serif font-medium", c.c)}>{c.v}</p>
          </div>
        ))}
      </div>

      {/* Tabela Literal */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-subtle/30 dark:bg-surface-dark-subtle/10 border-b border-surface-border dark:border-surface-dark-border">
                {["Data", "Descrição", "Entrada", "Saída", "Status", ""].map(h => (
                  <th key={h} className="p-6 text-[10px] font-black uppercase tracking-widest text-steel-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-20 text-center"><RefreshCw size={32} className="animate-spin text-brand-500 mx-auto" /></td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-xs font-bold text-steel-400 uppercase tracking-widest">Sem movimentação no período</td></tr>
              ) : (
                filtrados.map(m => {
                  const isEntrada = m.tipo === 'receita';
                  const isPago    = m.status === 'pago';
                  return (
                    <tr key={m.id} className="table-row-hover transition-all">
                      <td className="p-6 text-[11px] font-bold text-steel-500 whitespace-nowrap">{new Date(m.data_vencimento).toLocaleDateString()}</td>
                      <td className="p-6">
                        <p className="font-bold text-brand-900 dark:text-white">{m.descricao}</p>
                        <p className="text-[10px] text-steel-500 font-bold uppercase tracking-widest">{m.categorias_financeiras?.nome || '—'}</p>
                      </td>
                      <td className="p-6 font-black text-sm text-emerald-500">{isEntrada ? fmtBRL(m.valor) : "—"}</td>
                      <td className="p-6 font-black text-sm text-red-500">{!isEntrada ? fmtBRL(m.valor) : "—"}</td>
                      <td className="p-6">
                        <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          isPago ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {isPago ? "Conciliado" : "Pendente"}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => conciliar(m.id, m.status)}
                          className={cn("w-8 h-8 flex items-center justify-center rounded-xl border-2 transition-all",
                            isPago ? "bg-brand-500 border-brand-500 text-white" : "border-surface-border dark:border-surface-dark-border text-steel-400 hover:border-brand-500 hover:text-brand-500"
                          )}>
                          <CheckCircle size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
