"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Users, CheckCircle, Shield, Loader2, Send, MapPin, Calendar, ArrowRight } from "lucide-react";
import CityInput from "@/components/CityInput";
import { useAuth } from "@/context/AuthContext";
import { createQuote } from "@/lib/services/quotes";
import Reveal from "@/components/motion/Reveal";

export default function CotacaoDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tipo, setTipo] = useState("ida_volta");
  const [form, setForm] = useState({
    from: "", to: "", fromLat: "", fromLon: "", toLat: "", toLon: "",
    date: "", returnDate: "", passengers: "", notes: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md card glass p-10 md:p-14 border-emerald-500/20">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="font-serif text-3xl text-brand-900 dark:text-white mb-4">Solicitação Enviada!</h2>
          <p className="text-steel-600 dark:text-steel-400 mb-8 leading-relaxed">
            Sua cotação oficial foi disparada com sucesso. Nossa equipe entrará em contato em até <strong>12 horas</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/painel" className="btn-primary px-8 py-4 text-xs tracking-widest uppercase">
              Ver Meu Painel
            </Link>
            <button 
              onClick={() => { setSubmitted(false); setForm({ from: "", to: "", fromLat: "", fromLon: "", toLat: "", toLon: "", date: "", returnDate: "", passengers: "", notes: "" }); }}
              className="text-xs font-bold text-brand-500 uppercase tracking-widest hover:underline"
            >
              Nova Viagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date || !form.passengers) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      // Cálculo de distância (simplificado para o exemplo, mantendo o original)
      let distancia = 300;
      if (form.fromLat && form.fromLon && form.toLat && form.toLon) {
        const R = 6371;
        const lat1 = parseFloat(form.fromLat); const lon1 = parseFloat(form.fromLon);
        const lat2 = parseFloat(form.toLat); const lon2 = parseFloat(form.toLon);
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distancia = (R * c) * 1.3;
      }

      let basePrice = 0;
      if (tipo === "ida_volta") {
        basePrice = Math.max(1000, distancia * 2 * 5);
      } else {
        basePrice = distancia * 7.50;
      }

      await createQuote({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_phone: user.phone ?? null,
        from_city: form.from,
        to_city: form.to,
        from_lat: form.fromLat ? parseFloat(form.fromLat) : null,
        from_lon: form.fromLon ? parseFloat(form.fromLon) : null,
        to_lat: form.toLat ? parseFloat(form.toLat) : null,
        to_lon: form.toLon ? parseFloat(form.toLon) : null,
        distance_km: parseFloat(distancia.toFixed(2)),
        date: form.date,
        return_date: tipo === "ida_volta" ? form.returnDate : null,
        trip_type: tipo,
        passengers: parseInt(form.passengers),
        price: basePrice,
        notes: form.notes || null,
        status: "pending",
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "ida_volta", label: "Ida e volta" },
    { id: "in", label: "Transfer In" },
    { id: "out", label: "Transfer Out" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <Reveal direction="down">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-steel-400">Novo Agendamento</span>
              </div>
              <h1 className="font-serif text-4xl text-brand-900 dark:text-white">Para onde <span className="text-brand-500">vamos?</span></h1>
              <p className="text-sm text-steel-500 mt-2">Personalize sua rota e receba o valor final em minutos.</p>
           </Reveal>
        </div>
      </header>

      <div className="card glass p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-700">
           <MapPin size={200} className="text-brand-500" />
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          {/* Tabs */}
          <div className="bg-surface-subtle dark:bg-surface-dark-subtle/50 p-1.5 rounded-2xl inline-flex flex-wrap gap-1 border border-surface-border dark:border-surface-dark-border">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  tipo === t.id
                    ? "bg-white dark:bg-surface-dark shadow-md text-brand-500 border border-brand-500/10"
                    : "text-steel-500 hover:text-brand-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">Ponto de Partida</label>
               <CityInput id="cot-from" value={form.from}
                 onChange={v => update("from", v)} onCoordinateSelect={c => { update("fromLat", c.lat); update("fromLon", c.lon); }}
                 placeholder="Cidade ou endereço exato..." />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">Destino Final</label>
               <CityInput id="cot-to" value={form.to}
                 onChange={v => update("to", v)} onCoordinateSelect={c => { update("toLat", c.lat); update("toLon", c.lon); }}
                 placeholder="Qual o local de desembarque?" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">Data da Viagem</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                <input type="date" value={form.date} onChange={e => update("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" required />
              </div>
            </div>

            {tipo === "ida_volta" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">Retorno</label>
                <div className="relative">
                   <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                   <input type="date" value={form.returnDate} onChange={e => update("returnDate", e.target.value)}
                    min={form.date || new Date().toISOString().split("T")[0]} className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" required={tipo === "ida_volta"} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">Passageiros</label>
              <div className="relative">
                <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                <input type="number" min="1" max="15" value={form.passengers}
                  onChange={e => update("passengers", e.target.value)}
                  className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" placeholder="Pessoas" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">Necessidades Especiais (Opcional)</label>
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3}
              className="input-field bg-white dark:bg-surface-dark-elevated resize-none py-4 px-5 shadow-inner" placeholder="Ex: Cadeira de bebê, bagagem extra, paradas solicitadas no caminho..." />
          </div>

          <div className="pt-8 border-t border-surface-border dark:border-surface-dark-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-steel-500">
               <Shield size={20} className="text-emerald-500" />
               <p className="text-[10px] font-bold uppercase tracking-[0.15em] max-w-[200px]">Preço fixo garantido após aprovação central</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto px-12 py-5 text-xs tracking-widest uppercase font-bold shadow-soft-lg group">
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Enviar Solicitação <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
