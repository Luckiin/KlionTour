"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, Clock, CheckCircle2, XCircle, 
  ChevronRight, ArrowLeft, MessageSquare, Send, 
  Wallet, Calendar, Users, Loader2, Info, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyQuotes, updateQuote } from "@/lib/services/quotes";
import { QUOTE_STATUSES } from "@/lib/constants";
import Reveal from "@/components/motion/Reveal";

const fmtBRL = (v) => v ? `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

export default function MinhasCotacoesPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [counterNote, setCounterNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getMyQuotes(user.id);
      setQuotes(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, status, noteSuffix) => {
    setSaving(true);
    try {
      const now = new Date().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const currentNote = selected.admin_notes || "";
      const logEntry = noteSuffix ? `\n\n[Cliente ${now}]: ${noteSuffix}` : "";
      
      const updates = { 
        status, 
        admin_notes: currentNote + logEntry 
      };

      const updated = await updateQuote(id, updates);
      setQuotes(prev => prev.map(q => q.id === id ? updated : q));
      setSelected(updated);
      setCounterNote("");
    } catch (err) {
      alert("Erro ao processar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = quotes.filter(q => filter === "all" || q.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={40} className="animate-spin text-brand-500" />
        <p className="text-xs font-bold text-steel-500 uppercase tracking-widest">Buscando seu histórico...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Listagem */}
        <div className={`lg:col-span-4 space-y-6 ${selected ? "hidden lg:block" : "block"}`}>
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-surface-dark-elevated rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-sm overflow-x-auto scrollbar-hide">
            {["all", "pending", "proposed", "approved", "done"].map((val) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all ${
                  filter === val
                    ? "bg-brand-gradient text-white shadow-md"
                    : "text-steel-500 hover:text-brand-900 dark:hover:text-white"
                }`}
              >
                {QUOTE_STATUSES[val]?.label || "Todas"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="card glass p-10 text-center border-dashed">
                <p className="text-sm text-steel-500">Nenhuma cotação encontrada.</p>
              </div>
            ) : (
              filtered.map((q, i) => (
                <QuoteListItem 
                  key={q.id} 
                  quote={q} 
                  active={selected?.id === q.id}
                  onClick={() => setSelected(q)} 
                  index={i}
                />
              ))
            )}
          </div>
        </div>

        {/* Detalhe / Interação */}
        <div className={`lg:col-span-8 flex flex-col min-h-[600px] ${!selected ? "hidden lg:flex" : "flex"}`}>
          {!selected ? (
            <div className="flex-1 card glass border-dashed flex flex-col items-center justify-center p-20 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 mb-6">
                <FileText size={32} />
              </div>
              <h3 className="font-serif text-2xl text-brand-900 dark:text-white mb-2">Gerencie suas cotações</h3>
              <p className="text-sm text-steel-500 max-w-xs mx-auto">Selecione uma viagem ao lado para ver detalhes, aceitar propostas ou negociar valores.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              {/* Header Detalhe */}
              <div className="card glass p-6 md:p-8 relative overflow-hidden">
                <button 
                  onClick={() => setSelected(null)}
                  className="lg:hidden absolute top-6 left-6 p-2 rounded-lg bg-surface-subtle dark:bg-surface-dark-subtle text-brand-500"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className={`${selected ? "pl-12 lg:pl-0" : ""}`}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                       <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                         Ref #{selected.id.slice(0,8)}
                       </span>
                       <span className={`px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${QUOTE_STATUSES[selected.status]?.color}`}>
                         {QUOTE_STATUSES[selected.status]?.label}
                       </span>
                    </div>
                    <h2 className="font-serif text-3xl text-brand-900 dark:text-white">
                      {selected.from_city} <ChevronRight className="inline text-brand-500" /> {selected.to_city}
                    </h2>
                  </div>

                  <div className="text-right">
                     <p className="text-[10px] font-bold text-steel-500 uppercase tracking-widest mb-1">Valor Proposto</p>
                     <div className="font-serif text-4xl text-brand-900 dark:text-white tracking-tightest">
                       {fmtBRL(selected.total_price || selected.price)}
                     </div>
                  </div>
                </div>
              </div>

              {/* Grid de Infos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="card glass p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[9px] font-bold text-steel-400 uppercase tracking-widest">Datas</p>
                      <p className="text-sm font-bold text-brand-900 dark:text-white">
                        {new Date(selected.date + "T12:00:00").toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}
                        {selected.return_date && ` - ${new Date(selected.return_date + "T12:00:00").toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}`}
                      </p>
                    </div>
                 </div>
                 <div className="card glass p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Users size={20} /></div>
                    <div>
                      <p className="text-[9px] font-bold text-steel-400 uppercase tracking-widest">Passageiros</p>
                      <p className="text-sm font-bold text-brand-900 dark:text-white">{selected.passengers} pessoas</p>
                    </div>
                 </div>
                 <div className="card glass p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Wallet size={20} /></div>
                    <div>
                      <p className="text-[9px] font-bold text-steel-400 uppercase tracking-widest">Km Estimado</p>
                      <p className="text-sm font-bold text-brand-900 dark:text-white">{selected.distance_km} km</p>
                    </div>
                 </div>
              </div>

              {/* Chat / Negociação History */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="card glass flex-1 p-6 md:p-8 flex flex-col bg-surface/40 dark:bg-surface-dark/40 border-dashed">
                   <div className="flex items-center gap-2 mb-6 text-brand-500 underline underline-offset-4 decoration-brand-500/30">
                     <MessageSquare size={18} />
                     <h4 className="text-xs font-bold uppercase tracking-widest">Histórico de Negociação</h4>
                   </div>

                   <div className="flex-1 space-y-6 overflow-y-auto max-h-[300px] pr-4 scrollbar-hide">
                     {selected.admin_notes ? (
                       selected.admin_notes.split('\n\n').map((msg, i) => {
                         const isClient = msg.includes("[Cliente");
                         return (
                           <div key={i} className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                             <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                               isClient 
                                ? "bg-brand-500 text-white rounded-br-none" 
                                : "bg-white dark:bg-surface-dark-elevated text-brand-900 dark:text-white border border-surface-border dark:border-surface-dark-border rounded-bl-none shadow-sm"
                             }`}>
                               {msg.split(']:')[1] || msg}
                             </div>
                             <span className="text-[9px] font-bold text-steel-500 mt-2 uppercase tracking-widest px-2">
                               {msg.match(/\[(.*?)\]/)?.[1] || "KlionTour Admin"}
                             </span>
                           </div>
                         );
                       })
                     ) : (
                       <div className="h-full flex items-center justify-center text-steel-500 italic text-xs">
                         Nenhum histórico registrado ainda.
                       </div>
                     )}
                   </div>

                   {/* Ações de Negociação */}
                   <AnimatePresence>
                     {(selected.status === "proposed" || selected.status === "negotiating") && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 10 }}
                         className="pt-8 border-t border-surface-border dark:border-surface-dark-border mt-6 space-y-4"
                       >
                         {selected.status === "proposed" && (
                           <>
                             <div className="flex flex-col gap-3">
                               <textarea 
                                 value={counterNote}
                                 onChange={(e) => setCounterNote(e.target.value)}
                                 placeholder="Deseja pedir um desconto ou sugerir mudança? Digite aqui..."
                                 className="input-field bg-white/50 dark:bg-surface-dark-elevated/50 text-sm py-4 h-24 resize-none"
                               />
                               <div className="flex gap-4">
                                  <button 
                                    disabled={saving}
                                    onClick={() => handleAction(selected.id, "approved")}
                                    className="btn-primary flex-1 py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                  >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={18} /> Aceitar Valor Proposto</>}
                                  </button>
                                  <button 
                                    disabled={saving || !counterNote}
                                    onClick={() => handleAction(selected.id, "negotiating", counterNote)}
                                    className="flex-1 bg-white dark:bg-surface-dark-elevated border border-brand-500 text-brand-500 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-50 transition-colors disabled:opacity-40"
                                  >
                                    Enviar Contraproposta
                                  </button>
                               </div>
                             </div>
                             <p className="text-[10px] text-center text-steel-500 uppercase tracking-widest flex items-center justify-center gap-2">
                               <Info size={12} className="text-blue-500" /> Ao aceitar, o Admin será notificado para prosseguir com o pagamento.
                             </p>
                           </>
                         )}

                         {selected.status === "negotiating" && (
                            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                               <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                                 Aguardando resposta do Admin sobre sua contraproposta...
                               </p>
                            </div>
                         )}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuoteListItem({ quote, active, onClick, index }) {
  const s = QUOTE_STATUSES[quote.status] || QUOTE_STATUSES.pending;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`w-full text-left card glass p-5 transition-all group relative overflow-hidden ${
        active 
          ? "ring-2 ring-brand-500 shadow-lg" 
          : "hover:border-brand-500/30"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-[9px] font-bold text-steel-400 uppercase tracking-[0.2em] px-2 py-1 bg-surface-subtle dark:bg-surface-dark-subtle rounded-lg">
          #{quote.id.slice(0, 8)}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${s.color.split(' ')[1]}`}>
          {s.label}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
         <h4 className="font-serif text-lg text-brand-900 dark:text-white truncate">
           {quote.from_city}
         </h4>
         <p className="text-[10px] text-steel-500 font-bold uppercase mb-1">Para: {quote.to_city}</p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs font-bold text-brand-500">
          {fmtBRL(quote.total_price || quote.price)}
        </div>
        <div className="text-[10px] font-bold text-steel-400">
          {new Date(quote.date + "T12:00:00").toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
          {quote.return_date && ` - ${new Date(quote.return_date + "T12:00:00").toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}`}
        </div>
      </div>
      
      {quote.status === "proposed" && !active && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-brand-500 rounded-full animate-pulse mr-2 mt-2 border-2 border-white dark:border-surface-dark" />
      )}
    </motion.button>
  );
}
