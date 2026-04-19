"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronRight, CheckCircle, X, MessageSquare, Search, Filter, Loader2 } from "lucide-react";
import { getAllQuotes, updateQuote as updateQuoteService } from "@/lib/services/quotes";
import { QUOTE_STATUSES } from "@/lib/constants";

export default function AdminCotacoesPage() {
  const [quotes,    setQuotes]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [newPrice,  setNewPrice]  = useState("");
  const [saving,    setSaving]    = useState(false);

  const loadQuotes = useCallback(async () => {
    try {
      const data = await getAllQuotes();
      setQuotes(data);
    } catch (err) {
      console.error(err);
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
      return q.user_name?.toLowerCase().includes(s)  ||
             q.from_city?.toLowerCase().includes(s)  ||
             q.to_city?.toLowerCase().includes(s)    ||
             q.user_email?.toLowerCase().includes(s);
    });

  const counts = {
    all:      quotes.length,
    pending:  quotes.filter(q => q.status === "pending").length,
    approved: quotes.filter(q => q.status === "approved").length,
    paid:     quotes.filter(q => q.status === "paid").length,
    done:     quotes.filter(q => q.status === "done").length,
    rejected: quotes.filter(q => q.status === "rejected").length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-100">Gerenciar Cotações</h1>
        <p className="text-ink-300 text-sm mt-1">Analise, aprove ou recuse solicitações dos clientes</p>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field input-icon text-sm" placeholder="Buscar por cliente, rota..." />
        </div>
        <div className="flex gap-1 flex-wrap">
          {Object.entries({ all:"Todas", pending:"Pendentes", approved:"Aprovadas", paid:"Pagas", done:"Concluídas", rejected:"Recusadas" }).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition ${filter === val ? "bg-brand-500 text-white" : "bg-dark-100 text-ink-300 hover:bg-dark-50"}`}>
              {label} ({counts[val]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lista */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="card p-10 text-center text-ink-400">Nenhuma cotação encontrada</div>
            ) : filtered.map(q => {
              const s = QUOTE_STATUSES[q.status] || QUOTE_STATUSES.pending;
              return (
                <button key={q.id}
                  onClick={() => { setSelected(q); setAdminNote(q.admin_notes || ""); setNewPrice(q.total_price || ""); }}
                  className={`w-full card p-4 text-left hover:shadow-md transition ${selected?.id === q.id ? "ring-2 ring-brand-500" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-ink-100 truncate">{q.user_name}</span>
                        <span className={`badge ${s.color} text-xs flex-shrink-0`}>{s.label}</span>
                      </div>
                      <p className="text-xs text-ink-300 mt-0.5">{q.from_city} → {q.to_city}</p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {new Date(q.date + "T12:00:00").toLocaleDateString("pt-BR")} · {q.passengers} pax
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-brand-400">
                        {q.total_price ? `R$ ${Number(q.total_price).toLocaleString("pt-BR")}` : "—"}
                      </div>
                      <ChevronRight size={14} className="text-ink-400 ml-auto mt-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detalhe */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="card p-16 text-center text-ink-400 h-full flex flex-col items-center justify-center">
                <Filter size={40} className="mb-3 text-ink-500" />
                <p>Selecione uma cotação para ver os detalhes</p>
              </div>
            ) : (
              <div className="card p-6 space-y-5 sticky top-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-ink-100 text-lg">{selected.user_name}</h2>
                    <p className="text-sm text-ink-300">{selected.user_email} · {selected.user_phone}</p>
                  </div>
                  <span className={`badge ${QUOTE_STATUSES[selected.status]?.color}`}>
                    {QUOTE_STATUSES[selected.status]?.label}
                  </span>
                </div>

                <div className="bg-dark-300 rounded-xl divide-y text-sm">
                  {[
                    ["Rota",        `${selected.from_city} → ${selected.to_city}`],
                    ["Data ida",    new Date(selected.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long" })],
                    selected.return_date && ["Data volta", new Date(selected.return_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long" })],
                    ["Passageiros", `${selected.passengers} pessoas`],
                    ["Van",         selected.van_name],
                    ["Solicitado",  new Date(selected.created_at).toLocaleString("pt-BR")],
                  ].filter(Boolean).map(([label, val]) => (
                    <div key={label} className="flex justify-between px-4 py-2.5">
                      <span className="text-ink-300">{label}</span>
                      <span className="font-medium text-ink-100 text-right max-w-[55%]">{val}</span>
                    </div>
                  ))}
                  {selected.notes && (
                    <div className="px-4 py-2.5">
                      <p className="text-ink-300 mb-1">Obs. do cliente:</p>
                      <p className="text-ink-200 italic">"{selected.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Ações admin */}
                {(selected.status === "pending" || selected.status === "approved") && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-ink-200 mb-1">
                        Valor final (R$){" "}
                        {selected.total_price && (
                          <span className="text-ink-400 font-normal">atual: R$ {Number(selected.total_price).toLocaleString("pt-BR")}</span>
                        )}
                      </label>
                      <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                        className="input-field text-sm" placeholder="Digite o valor final" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-200 mb-1">Mensagem ao cliente</label>
                      <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                        className="input-field resize-none text-sm"
                        placeholder="Ex: Confirmado para às 7h, motorista Carlos. Pagamento via PIX..." />
                    </div>
                    {selected.status === "pending" || selected.status === "negotiating" ? (
                      <div className="flex gap-3">
                        <button disabled={saving}
                          onClick={() => {
                            const now = new Date().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                            const newFullNote = `[Admin ${now}]: ${adminNote || "Proposta enviada."}${selected.admin_notes ? "\n\n" + selected.admin_notes : ""}`;
                            handleAction(selected.id, {
                              status:      "proposed",
                              admin_notes: newFullNote,
                              total_price: newPrice ? Number(newPrice) : selected.total_price,
                            });
                          }}
                          className="btn-primary flex-1 disabled:opacity-50">
                          <CheckCircle size={16} /> {saving ? "Salvando..." : "Enviar Proposta"}
                        </button>
                        <button disabled={saving}
                          onClick={() => handleAction(selected.id, {
                            status:      "rejected",
                            admin_notes: `[Admin]: Recusado. ${adminNote}`,
                          })}
                          className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                          <X size={16} /> Recusar
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {selected.status === "approved" && (
                  <button onClick={() => handleAction(selected.id, { status: "paid" })}
                    className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle size={16} /> Marcar como Pago
                  </button>
                )}

                {selected.status === "paid" && (
                  <button onClick={() => handleAction(selected.id, { status: "done" })}
                    className="btn-primary w-full">
                    <CheckCircle size={16} /> Marcar como Concluída
                  </button>
                )}

                {selected.admin_notes && (
                  <div className="bg-brand-900/30 rounded-xl p-3 text-sm text-brand-400 flex items-start gap-2">
                    <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Nota registrada:</strong> {selected.admin_notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
