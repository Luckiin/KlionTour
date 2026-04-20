"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ArrowDownCircle, Plus, Search, Filter, ChevronLeft, ChevronRight, 
  RefreshCw, CheckCircle, Trash2, Pencil, Calendar, Settings
} from "lucide-react";
import { toast } from "sonner";
import { useLancamentos } from "@/lib/hooks/useFinanceiro";
import ModalLancamento from "@/components/admin/financeiro/ModalLancamento";
import { fmtBRL, cn } from "@/lib/utils";

const MESES_ABREV = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export default function ContasPagar() {
  const [mounted, setMounted] = useState(false);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());

  useEffect(() => { setMounted(true); }, []);

  const [modal, setModal] = useState(null);
  const [busca, setBusca] = useState("");

  const mesISO = useMemo(() => `${ano}-${String(mes + 1).padStart(2, "0")}`, [ano, mes]);
  const { lancamentos, isLoading, mutate } = useLancamentos({ tipo: 'despesa', mes: mesISO, limit: 1000 });

  async function toggleStatus(id, statusAtual) {
    const novoStatus = statusAtual === "pago" ? "pendente" : "pago";
    try {
      await fetch(`/api/admin/financeiro/lancamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: novoStatus, 
          data_pagamento: novoStatus === "pago" ? new Date().toISOString().slice(0, 10) : null 
        }),
      });
      toast.success(novoStatus === "pago" ? "Pagamento confirmado!" : "Reaberto");
      mutate();
    } catch { toast.error("Erro ao atualizar."); }
  }

  async function excluir(id) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await fetch(`/api/admin/financeiro/lancamentos/${id}`, { method: "DELETE" });
      toast.success("Excluído.");
      mutate();
    } catch { toast.error("Erro ao excluir."); }
  }

  const filtrados = useMemo(() => {
    return lancamentos.filter(l => 
      l.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      l.fornecedor?.toLowerCase().includes(busca.toLowerCase())
    );
  }, [lancamentos, busca]);

  const totalPendente = filtrados.filter(l => l.status !== "pago").reduce((s, l) => s + (l.valor || 0), 0);
  const totalPago     = filtrados.filter(l => l.status === "pago").reduce((s, l) => s + (l.valor_pago || l.valor || 0), 0);

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-white flex items-center gap-2">
            <ArrowDownCircle size={20} className="text-red-500" /> Contas a Pagar
          </h1>
          <p className="text-sm text-steel-500 mt-1">Gestão de despesas e custos KlionTour</p>
        </div>
        <button onClick={() => setModal({ tipo: 'despesa' })} className="btn-primary px-6 py-3 bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Plus size={18} /> Nova Despesa
        </button>
      </div>

      {/* Sumário */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { l: "Pago no Mês", v: fmtBRL(totalPago), c: "text-red-500", bg: "bg-red-500/5" },
          { l: "A Pagar (Aberto)", v: fmtBRL(totalPendente), c: "text-amber-500", bg: "bg-amber-500/5" },
          { l: "Total Previsto", v: fmtBRL(totalPago + totalPendente), c: "text-steel-400", bg: "bg-surface-subtle" },
        ].map(k => (
          <div key={k.l} className={cn("glass-card border-none rounded-2xl p-5 flex flex-col justify-center", k.bg)}>
            <p className="text-[10px] font-bold text-steel-500 uppercase tracking-widest mb-1">{k.l}</p>
            <p className={cn("text-2xl font-serif font-medium", k.c)}>{k.v}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden">
        {/* Filtros */}
        <div className="p-6 border-b border-surface-border dark:border-surface-dark-border flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setAno(a => a - 1)} className="p-2 rounded-xl hover:bg-surface-subtle text-steel-400 transition-all"><ChevronLeft size={16} /></button>
            <span className="text-sm font-black text-brand-900 dark:text-white w-12 text-center">{ano}</span>
            <button onClick={() => setAno(a => a + 1)} className="p-2 rounded-xl hover:bg-surface-subtle text-steel-400 transition-all"><ChevronRight size={16} /></button>
            
            <div className="h-4 w-px bg-surface-border dark:bg-surface-dark-border mx-2" />
            
            <div className="flex gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {MESES_ABREV.map((m, i) => (
                <button key={m} onClick={() => setMes(i)}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                    i === mes ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-steel-400 hover:text-brand-900 hover:bg-red-500/5"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400" />
            <input 
              type="text" 
              placeholder="Buscar por descrição ou fornecedor..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="input-field pl-12 py-3 text-xs"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/30 dark:bg-surface-dark-subtle/10 border-b border-surface-border dark:border-surface-dark-border">
                {["Status", "Descrição", "Vencimento", "Valor", "Fornecedor", ""].map(h => (
                  <th key={h} className="p-6 text-[10px] font-black uppercase tracking-widest text-steel-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-20 text-center"><RefreshCw size={32} className="animate-spin text-brand-500 mx-auto" /></td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-xs font-bold text-steel-400 uppercase tracking-widest">Nenhuma despesa no período</td></tr>
              ) : (
                filtrados.map(l => {
                  const pago = l.status === "pago";
                  return (
                    <tr key={l.id} className={cn("table-row-hover", pago && "opacity-60")}>
                      <td className="p-6">
                        <button onClick={() => toggleStatus(l.id, l.status)}
                          className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            pago ? "bg-emerald-500 border-emerald-500 text-white" : "border-surface-border dark:border-surface-dark-border hover:border-red-500"
                          )}>
                          {pago && <CheckCircle size={14} />}
                        </button>
                      </td>
                      <td className="p-6 min-w-[220px]">
                        <p className={cn("text-sm font-medium", pago ? "text-steel-400 line-through" : "text-brand-900 dark:text-white")}>{l.descricao}</p>
                        <p className="text-[10px] text-steel-500 font-bold uppercase tracking-widest">{l.categorias_financeiras?.nome || 'Geral'}</p>
                      </td>
                      <td className="p-6 text-xs font-bold text-steel-500 whitespace-nowrap">
                        {new Date(l.data_vencimento).toLocaleDateString()}
                      </td>
                      <td className="p-6 font-black text-sm whitespace-nowrap" style={{ color: pago ? "inherit" : "#ef4444" }}>
                        {fmtBRL(pago ? (l.valor_pago || l.valor) : l.valor)}
                      </td>
                      <td className="p-6 text-xs text-steel-500 font-medium">
                        {l.fornecedor || "—"}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setModal({ tipo: 'despesa', original: l })} className="p-2 rounded-xl text-steel-400 hover:text-brand-500 hover:bg-brand-500/10 transition-all"><Pencil size={16} /></button>
                          <button onClick={() => excluir(l.id)} className="p-2 rounded-xl text-steel-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ModalLancamento tipo={modal.tipo} original={modal.original} onClose={() => setModal(null)} onSalvo={mutate} />}
    </div>
  );
}
