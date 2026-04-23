"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle, X, MessageSquare, Search, Filter, Loader2 } from "lucide-react";
import { getAllQuotes, updateQuote as updateQuoteService } from "@/lib/services/quotes";
import { QUOTE_STATUSES } from "@/lib/constants";
import Reveal from "@/components/motion/Reveal";
const MONEY = (v) => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

export default function AdminCotacoesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadQuotes = useCallback(async () => {
    try {
      const data = await getAllQuotes();
      setQuotes(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const applyUpdate = (id, changes) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...changes } : q));
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...changes }));
  };

  const handleAction = async (id, changes) => {
    setSaving(true);
    try {
      await updateQuoteService(id, changes);
      applyUpdate(id, changes);
      setAdminNote("");
      setNewPrice("");
    } catch (err) {
      alert("Erro ao atualizar cotação: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = quotes
    .filter(q => filter === "all" || q.status === filter)
    .filter(q => {
      if (!search) return true;
      const s = search.toLowerCase();
      return q.user_name?.toLowerCase().includes(s) ||
        q.from_city?.toLowerCase().includes(s) ||
        q.to_city?.toLowerCase().includes(s) ||
        q.user_email?.toLowerCase().includes(s);
    });

  const counts = {
    all: quotes.length,
    pending: quotes.filter(q => q.status === "pending").length,
    approved: quotes.filter(q => q.status === "approved").length,
    paid: quotes.filter(q => q.status === "paid").length,
    done: quotes.filter(q => q.status === "done").length,
    rejected: quotes.filter(q => q.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <Reveal direction="down">
            <h1 className="text-3xl font-serif font-medium text-brand-900 dark:text-white">Gerenciar Cotações</h1>
            <p className="text-steel-500 dark:text-steel-400 text-sm mt-1">Gestão de propostas, orçamentos e reservas via malha digital</p>
          </Reveal>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card p-6 flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field input-icon" placeholder="Buscar por cliente, aeronave ou destino..." />
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {Object.entries({
            all: "Todas",
            pending: "Pendentes",
            proposed: "Propostas",
            approved: "Aprovadas",
            paid: "Pagas",
            done: "Concluídas",
            rejected: "Recusadas"
          }).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl font-bold transition-all ${filter === val ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" : "bg-surface-subtle dark:bg-surface-dark-subtle text-steel-500 dark:text-steel-400 hover:bg-brand-500/10"}`}>
              {label} <span className="opacity-50 ml-1">({counts[val] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-24 flex flex-col items-center justify-center border-dashed">
          <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
          <p className="text-sm font-bold text-steel-500 uppercase tracking-widest">Carregando Cotações...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Lista de Cotações */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.length === 0 ? (
              <div className="card p-24 text-center border-dashed opacity-60">
                <Filter size={48} className="text-steel-300 dark:text-steel-600 mx-auto mb-4" />
                <p className="text-sm font-bold text-steel-500 uppercase tracking-widest">Nenhuma cotação nesta categoria</p>
              </div>
            ) : filtered.map((q, i) => {
              const s = QUOTE_STATUSES[q.status] || QUOTE_STATUSES.pending;
              const isSelected = selected?.id === q.id;
              return (
                <Reveal key={q.id} direction="up" delay={i * 0.02}>
                  <button
                    onClick={() => { setSelected(q); setAdminNote(""); setNewPrice(q.total_price || ""); }}
                    className={`w-full card overflow-hidden group transition-all duration-300 ${isSelected ? "ring-2 ring-brand-500 shadow-soft-lg" : "hover:shadow-md"}`}>
                    <div className={`p-5 flex items-start justify-between gap-4 ${isSelected ? "bg-brand-500/5" : ""}`}>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          <span className="font-bold text-brand-900 dark:text-white truncate">{q.user_name}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-steel-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                          {q.from_city} <ChevronRight size={10} /> {q.to_city}
                        </p>
                        <p className="text-[10px] font-medium text-steel-500 dark:text-steel-400">
                          {new Date(q.date + "T12:00:00").toLocaleDateString("pt-BR")}
                          {q.return_date && ` - ${new Date(q.return_date + "T12:00:00").toLocaleDateString("pt-BR")}`}
                          {` · ${q.passengers} pax`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif text-lg font-medium text-brand-600 dark:text-brand-300 mb-1">
                          {q.total_price ? `R$ ${Number(q.total_price).toLocaleString("pt-BR")}` : "—"}
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-brand-500 text-white" : "bg-steel-100 dark:bg-steel-800 text-steel-400 group-hover:bg-brand-500 group-hover:text-white shadow-sm"}`}>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Detalhe da Cotação */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="card p-24 text-center border-dashed flex flex-col items-center justify-center h-full sticky top-8">
                <div className="w-20 h-20 rounded-full bg-surface-subtle dark:bg-surface-dark-subtle flex items-center justify-center text-steel-300 dark:text-steel-600 mb-6 border border-surface-border dark:border-surface-dark-border">
                  <Filter size={32} />
                </div>
                <h3 className="font-serif text-2xl text-brand-900 dark:text-white mb-2">Detalhes da Cotação</h3>
                <p className="text-steel-500 max-w-xs">Selecione uma solicitação ao lado para gerenciar valores e status.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="card overflow-hidden sticky top-8 shadow-soft-xl border-brand-500/10">
                <div className="p-8 border-b border-surface-border dark:border-surface-dark-border bg-surface-subtle/30 dark:bg-surface-dark-subtle/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-serif font-medium text-brand-900 dark:text-white truncate">{selected.user_name}</h2>
                      <p className="text-xs font-medium text-steel-500 dark:text-steel-400 mt-1 uppercase tracking-widest">{selected.user_email} · {selected.user_phone}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${QUOTE_STATUSES[selected.status]?.color}`}>
                      {QUOTE_STATUSES[selected.status]?.label}
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Dados da Viagem */}
                  <div className="bg-surface-subtle/30 dark:bg-surface-dark-subtle/20 rounded-3xl overflow-hidden border border-surface-border dark:border-surface-dark-border">
                    <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                      {[
                        ["Rota Solicitada", <div className="flex items-center gap-2 font-bold text-brand-900 dark:text-white">{selected.from_city} <ChevronRight size={12} className="text-steel-400" /> {selected.to_city}</div>],
                        ["Data de Ida", new Date(selected.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })],
                        selected.return_date && ["Data de Volta", new Date(selected.return_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })],
                        ["Passageiros", `${selected.passengers} pessoas`],
                        ["Modelo de Aeronave/Van", selected.van_name],
                        ["Valor Estimado", MONEY(selected.price)],
                        ["Valor da Proposta (Atual com desconto)", selected.total_price ? MONEY(selected.total_price) : "A definir"],
                        ["Data de Solicitação", new Date(selected.created_at).toLocaleString("pt-BR")],
                      ].filter(Boolean).map(([label, val]) => (
                        <div key={label} className="flex justify-between px-6 py-4 items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-steel-500 dark:text-steel-400">{label}</span>
                          <span className="text-sm font-medium text-brand-900 dark:text-white text-right max-w-[60%]">{val}</span>
                        </div>
                      ))}
                    </div>
                    {selected.notes && (
                      <div className="px-6 py-5 bg-brand-500/5 border-t border-surface-border dark:border-surface-dark-border">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">Mensagem do Cliente:</p>
                        <p className="text-sm italic text-brand-900/70 dark:text-white/70 leading-relaxed font-serif">"{selected.notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Fluxo de Negociação */}
                  {["pending", "negotiating"].includes(selected.status) && (
                    <div className="space-y-6 pt-4 border-t border-surface-border dark:border-surface-dark-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-widest text-brand-900 dark:text-white block ml-1">Propôr Valor (R$)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 font-bold text-sm">R$</span>
                            <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                              className="input-field pl-12 text-lg font-serif font-medium" placeholder="0.00" />
                          </div>
                          {selected.total_price && (
                            <p className="text-[10px] text-steel-500 ml-1">Valor atual: R$ {Number(selected.total_price).toLocaleString("pt-BR")}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-widest text-brand-900 dark:text-white block ml-1">Nota Interna / Mensagem</label>
                          <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                            className="input-field resize-none text-sm p-4"
                            placeholder="Instruções de pagamento ou detalhes do serviço..." />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {selected.status === "negotiating" && (
                          <button disabled={saving}
                            onClick={() => setShowConfirm(true)}
                            className="px-8 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                            <CheckCircle size={18} /> Aceitar
                          </button>
                        )}

                        <button disabled={saving}
                          onClick={() => {
                            const now = new Date().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            const newEntry = `[Admin ${now}]: ${adminNote || "Proposta enviada."}`;
                            const newFullNote = selected.admin_notes ? `${selected.admin_notes}\n\n${newEntry}` : newEntry;

                            handleAction(selected.id, {
                              status: "proposed",
                              admin_notes: newFullNote,
                              total_price: newPrice ? Number(newPrice) : selected.total_price,
                            });
                          }}
                          className="btn-primary flex-1 py-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-500/20">
                          {saving ? "Processando..." : <><CheckCircle size={18} /> Enviar Nova Proposta</>}
                        </button>

                        {(selected.status === "pending" || selected.status === "negotiating") && (
                          <button disabled={saving}
                            onClick={() => {
                              if (!confirm("Atenção: Deseja realmente recusar esta cotação?")) return;
                              handleAction(selected.id, {
                                status: "rejected",
                                admin_notes: `[Admin]: Recusado. ${adminNote}`,
                              });
                            }}
                            className="px-8 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                            <X size={18} /> Recusar
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selected.status === "proposed" && (
                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 text-center">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        Proposta enviada! Aguardando resposta do cliente...
                      </p>
                    </div>
                  )}

                  {selected.status === "approved" && (
                    <div className="pt-4">
                      <button onClick={() => handleAction(selected.id, { status: "paid" })}
                        className="btn-primary w-full py-5 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-[0.2em]">
                        <CheckCircle size={20} /> Confirmar Pagamento Efetuado
                      </button>
                    </div>
                  )}

                  {selected.status === "paid" && (
                    <div className="pt-4">
                      <button onClick={() => handleAction(selected.id, { status: "done" })}
                        className="btn-primary w-full py-5 text-xs font-black uppercase tracking-[0.2em]">
                        <CheckCircle size={20} /> Concluir e Arquivar Viagem
                      </button>
                    </div>
                  )}

                  {selected.admin_notes && (
                    <div className="bg-surface-subtle dark:bg-surface-dark-subtle/50 rounded-2xl p-6 border border-surface-border dark:border-surface-dark-border">
                      <div className="flex items-center gap-3 mb-6">
                        <MessageSquare size={16} className="text-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-900 dark:text-white">Relatório de Atividades / Chat</span>
                      </div>

                      <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
                        {selected.admin_notes
                          .split('\n\n')
                          .filter(msg => msg.trim())
                          .map(msg => {
                            const match = msg.match(/\[.*?\s(\d{2})\/(\d{2}),\s(\d{2}):(\d{2})(?::(\d{2}))?\]/);
                            let timestamp = 0;
                            if (match) {
                              const [, d, m, h, min, s] = match;
                              timestamp = new Date(new Date().getFullYear(), m - 1, d, h, min, s || 0).getTime();
                            }
                            return { content: msg, timestamp, isClient: msg.includes("[Cliente") };
                          })
                          .sort((a, b) => {
                            if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
                            if (a.isClient && !b.isClient) return -1;
                            if (!a.isClient && b.isClient) return 1;
                            return 0;
                          })
                          .map(({ content: msg }, i) => {
                            const isClient = msg.includes("[Cliente");
                            return (
                              <div key={i} className={`flex flex-col ${isClient ? "items-start" : "items-end"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${!isClient
                                  ? "bg-brand-500 text-white rounded-br-none shadow-md"
                                  : "bg-white dark:bg-surface-dark-elevated text-brand-900 dark:text-white border border-surface-border dark:border-surface-dark-border rounded-bl-none shadow-sm"
                                  }`}>
                                  {msg.split(']:')[1] || msg}
                                </div>
                                <span className="text-[9px] font-bold text-steel-500 mt-2 uppercase tracking-widest px-2">
                                  {msg.match(/\[(.*?)\]/)?.[1] || "Admin"}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Aprovação */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card glass w-full max-w-md relative z-10 p-8 shadow-2xl border-emerald-500/20"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                <CheckCircle size={32} />
              </div>

              <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-serif font-medium text-brand-900 dark:text-white">Aprovar Viagem?</h3>
                <p className="text-sm text-steel-500">
                  Deseja aceitar a contraproposta de <span className="font-bold text-brand-600 dark:text-brand-400">R$ {Number(selected?.total_price).toLocaleString("pt-BR")}</span> e finalizar a negociação?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-steel-500 bg-surface-subtle dark:bg-surface-dark-subtle hover:bg-steel-100 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={async () => {
                    setShowConfirm(false);
                    await handleAction(selected.id, {
                      status: "approved",
                      admin_notes: `[Admin]: Contraproposta aceita. Viagem aprovada!${selected.admin_notes ? "\n\n" + selected.admin_notes : ""}`,
                      total_price: selected.total_price,
                    });
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
                >
                  Sim, Aprovar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
