"use client";

import { useEffect, useState } from "react";
import { X, Check, RefreshCw, Upload, FileText, Info, Trash2, Calendar, DollarSign, Tag, Landmark } from "lucide-react";
import { toast } from "sonner";
import { useCategorias, useContas } from "@/lib/hooks/useFinanceiro";
import AnexoFinanceiro from "./AnexoFinanceiro";
import { maskMoeda } from "@/lib/utils";

export default function ModalLancamento({ tipo = "receita", original = null, onClose, onSalvo }) {
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState("dados"); // dados | anexos
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: tipo,
    status: "pendente",
    data_vencimento: new Date().toISOString().slice(0, 10),
    data_pagamento: "",
    valor_pago: "",
    categoria_id: "",
    conta_id: "",
    fornecedor: ""
  });

  // Usamos a prop 'tipo' ou o tipo do original para o filtro inicial, 
  // garantindo que as categorias carreguem imediatamente sem esperar o estado.
  const filterTipo = original?.tipo || tipo || formData.tipo;
  const { categorias, isLoading: loadingCats } = useCategorias({ tipo: filterTipo });
  const { contas, isLoading: loadingContas }     = useContas();

  useEffect(() => {
    if (original) {
      setFormData({
        ...original,
        valor: String(original.valor || ""),
        valor_pago: String(original.valor_pago || ""),
        data_vencimento: original.data_vencimento?.slice(0, 10) || "",
        data_pagamento: original.data_pagamento?.slice(0, 10) || "",
        categoria_id: original.categoria_id || "",
        conta_id: original.conta_id || ""
      });
    } else {
      // Garantir que o tipo está sincronizado com a prop se for novo
      setFormData(prev => ({ ...prev, tipo: tipo }));
    }
  }, [original, tipo]);

  // Autoseleção se houver apenas uma opção
  useEffect(() => {
    if (!original && categorias.length === 1 && !formData.categoria_id) {
      setFormData(prev => ({ ...prev, categoria_id: categorias[0].id }));
    }
    if (!original && contas.length === 1 && !formData.conta_id) {
      setFormData(prev => ({ ...prev, conta_id: contas[0].id }));
    }
  }, [categorias, contas, original]);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    
    // Validação básica
    if (!formData.descricao || !formData.valor || !formData.categoria_id) {
      return toast.error("Preencha todos os campos obrigatórios (Descrição, Valor e Categoria)");
    }

    setLoading(true);

    const payload = {
      ...formData,
      valor: Number(String(formData.valor).replace(/\D/g, "")) / 100,
      valor_pago: formData.valor_pago ? Number(String(formData.valor_pago).replace(/\D/g, "")) / 100 : null,
      // Converte string vazia em NULL para evitar erro de UUID no Postgres
      categoria_id: formData.categoria_id || null,
      conta_id: formData.conta_id || null,
    };

    try {
      const url = original ? `/api/admin/financeiro/lancamentos/${original.id}` : `/api/admin/financeiro/lancamentos`;
      const res = await fetch(url, {
        method: original ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erro ao salvar");
      
      toast.success(original ? "Lançamento atualizado!" : "Lançamento criado com sucesso!");
      onSalvo?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar lançamento.");
    } finally {
      setLoading(false);
    }
  }

  const isDespesa = formData.tipo === "despesa";
  const accent    = isDespesa ? "bg-red-500" : "bg-emerald-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark-elevated rounded-[2.5rem] shadow-2xl overflow-hidden border border-surface-border dark:border-surface-dark-border">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-surface-border dark:border-surface-dark-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${accent} flex items-center justify-center text-white shadow-lg`}>
                {isDespesa ? <DollarSign size={20} /> : <TrendingUp size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-brand-900 dark:text-white">
                  {original ? "Editar Lançamento" : `Nova ${isDespesa ? 'Despesa' : 'Receita'}`}
                </h2>
                <div className="flex gap-4 mt-1">
                  <button onClick={() => setTab("dados")} className={`text-[10px] font-black uppercase tracking-widest ${tab === 'dados' ? 'text-brand-500' : 'text-steel-400'}`}>Informações</button>
                  {original && <button onClick={() => setTab("anexos")} className={`text-[10px] font-black uppercase tracking-widest ${tab === 'anexos' ? 'text-brand-500' : 'text-steel-400'}`}>Anexos e Notas</button>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-steel-400 hover:bg-surface-subtle transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto overflow-x-hidden">
          {tab === "dados" ? (
            <form id="form-lanc" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Coluna 1 */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Descrição</label>
                    <input autoFocus required className="input-field" placeholder="Ex: Pagamento Fornecedor X"
                      value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Status</label>
                      <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="pendente">Pendente</option>
                        <option value="pago">{isDespesa ? 'Pago' : 'Recebido'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Valor Previsto</label>
                    <input className="input-field font-mono font-bold text-base" value={formData.valor}
                      onChange={e => setFormData({...formData, valor: maskMoeda(e.target.value)})} placeholder="R$ 0,00" />
                  </div>
                </div>

                {/* Coluna 2 */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Categoria</label>
                    <div className="relative">
                      <select className="input-field" value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                        <option value="">{loadingCats ? 'Carregando...' : 'Selecione...'}</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                      {loadingCats && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          <RefreshCw size={12} className="animate-spin text-brand-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Vencimento</label>
                    <input type="date" required className="input-field" value={formData.data_vencimento}
                      onChange={e => setFormData({...formData, data_vencimento: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Conta Bancária</label>
                    <select className="input-field" value={formData.conta_id} onChange={e => setFormData({...formData, conta_id: e.target.value})}>
                      <option value="">Caixa Principal</option>
                      {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {formData.status === "pago" && (
                <div className="p-6 bg-surface-subtle dark:bg-surface-dark-subtle/50 rounded-3xl grid grid-cols-2 gap-6 border border-surface-border dark:border-surface-dark-border">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Valor {isDespesa ? 'Pago' : 'Recebido'}</label>
                    <input className="input-field font-mono font-bold bg-white dark:bg-surface-dark" value={formData.valor_pago}
                      onChange={e => setFormData({...formData, valor_pago: maskMoeda(e.target.value)})} placeholder="R$ 0,00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-steel-500 mb-2 block ml-1">Data da Baixa</label>
                    <input type="date" className="input-field bg-white dark:bg-surface-dark" value={formData.data_pagamento}
                      onChange={e => setFormData({...formData, data_pagamento: e.target.value})} />
                  </div>
                </div>
              )}
            </form>
          ) : (
            <AnexoFinanceiro lancamentoId={original?.id} />
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-surface-border dark:border-surface-dark-border bg-surface-subtle/30 dark:bg-surface-dark-subtle/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-steel-400">
            <Info size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Os campos com * são obrigatórios</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-steel-500 hover:bg-surface-subtle transition-all">Cancelar</button>
            <button form="form-lanc" disabled={loading} className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
              {original ? 'Salvar Alterações' : 'Criar Lançamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
}
