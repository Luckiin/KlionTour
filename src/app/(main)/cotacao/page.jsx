"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Users, CheckCircle, Shield, Loader2, Send } from "lucide-react";
import CityInput from "@/components/CityInput";
import { useAuth } from "@/context/AuthContext";
import { createQuote } from "@/lib/services/quotes";

export default function CotacaoPage() {
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

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-dark-300 px-4">
        <div className="text-center max-w-sm">
          <Shield size={52} className="text-ink-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink-100 mb-2">Login necessário</h2>
          <p className="text-ink-300 text-sm mb-6">
            Você precisa estar logado para solicitar uma cotação oficial.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/entrar" className="btn-primary">Entrar</Link>
            <Link href="/auth/cadastro" className="btn-outline">Cadastrar</Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-dark-300 px-4">
        <div className="text-center max-w-md bg-dark-200/90 backdrop-blur-md border border-brand-500/20 p-8 rounded-3xl shadow-2xl">
          <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-ink-100 mb-3">Solicitação Recebida!</h2>
          <p className="text-ink-200 mb-2 text-sm leading-relaxed">
            Sua cotação oficial foi disparada com sucesso para nossa central.
          </p>
          <p className="text-ink-400 mb-8 text-sm">
            Nossa equipe entrará em contato pelo WhatsApp/e-mail em até <strong>12 horas</strong> com o fechamento e confirmação de disponibilidade .
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/painel" className="btn-primary py-3">Meu Painel</Link>
            <button onClick={() => { setSubmitted(false); setForm({ from: "", to: "", fromLat: "", fromLon: "", toLat: "", toLon: "", date: "", returnDate: "", passengers: "", notes: "" }); }}
              className="btn-outline py-3 text-brand-400 border-brand-500/30 hover:bg-brand-500/10">
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
      // 1. Calcula Distância Exata (Haversine)
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
      } else {
        const lenHash = form.from.length * 10 + form.to.length * 5;
        distancia = lenHash > 0 ? lenHash * 2.5 : 300;
      }

      // 2. Mates de Preço (Idêntica à Simulação)
      let basePrice = 0;
      if (tipo === "ida_volta") {
        const distTotal = distancia * 2;
        let calcPrice = distTotal * 5;
        basePrice = calcPrice < 1000 ? 1000 : calcPrice;
      } else if (tipo === "in" || tipo === "out") {
        basePrice = distancia * 7.50;
      } else {
        basePrice = distancia * 5;
      }

      // 3. Persistência na Nuvem - Insere Cotação Oficial
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
        trip_type: tipo, // agora o banco de dados vai suportar in e out
        passengers: parseInt(form.passengers),
        price: basePrice, // Motor já calculou aqui no Client
        notes: form.notes || null,
        status: "pending",
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Houve um erro de servidor ao enviar a cotação. Verifique se as alterações no banco de dados foram realizadas.");
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
    <div className="bg-dark-300 min-h-screen py-10 px-4 bg-[url('/hero-bg.png')] bg-cover bg-fixed relative">
      <div className="absolute inset-0 bg-dark-400/90 z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Solicitar Cotação Oficial</h1>
          <p className="text-brand-400 font-medium">Preencha os dados e engatilhe sua reserva executiva com preço fixo.</p>
        </div>

        <div className="bg-dark-200/80 backdrop-blur-xl border border-brand-500/20 p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/50">
          {/* Radio Tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-white/5 pb-6">
            <span className="text-ink-400 font-medium mr-2">Tipo de Serviço:</span>
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tipo === t.id
                  ? "bg-brand-500 text-dark-400 shadow-[0_0_15px_rgba(36,204,78,0.4)]"
                  : "bg-dark-100/50 text-ink-300 hover:text-ink-100 hover:bg-dark-100 border border-white/5"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <CityInput id="cot-from" label="Origem (Embarque) *" value={form.from}
                  onChange={v => update("from", v)} onCoordinateSelect={c => { update("fromLat", c.lat); update("fromLon", c.lon); }}
                  placeholder="Busque o endereço..." />
              </div>
              <div className="w-full">
                <CityInput id="cot-to" label="Destino (Desembarque) *" value={form.to}
                  onChange={v => update("to", v)} onCoordinateSelect={c => { update("toLat", c.lat); update("toLon", c.lon); }}
                  placeholder="Qual o local final de parada?" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-ink-200 mb-2">Data de Saída *</label>
                <input type="date" value={form.date} onChange={e => update("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className="input-field w-full py-3 px-4 bg-dark-400/50" required />
              </div>

              {tipo === "ida_volta" && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-ink-200 mb-2">Data de Retorno *</label>
                  <input type="date" value={form.returnDate} onChange={e => update("returnDate", e.target.value)}
                    min={form.date || new Date().toISOString().split("T")[0]} className="input-field w-full py-3 px-4 bg-dark-400/50" required={tipo === "ida_volta"} />
                </div>
              )}

              <div className="w-full">
                <label className="block text-sm font-medium text-ink-200 mb-2">Quantidade Passageiros *</label>
                <div className="relative">
                  <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                  <input type="number" min="1" max="15" value={form.passengers}
                    onChange={e => update("passengers", e.target.value)}
                    className="input-field w-full pl-12 pr-4 bg-dark-400/50 py-3 font-semibold" placeholder="Máx 15 lugares" required />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-ink-200 mb-2">Observações Adicionais (Opcional)</label>
              <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3}
                className="input-field w-full bg-dark-400/50 resize-none py-3 px-4" placeholder="Algum detalhe extra? Parada no caminho, mala excedente, necessita cadeira especial?" />
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary py-4 px-10 text-base font-bold flex items-center justify-center gap-3 w-full md:w-auto shadow-[0_0_20px_rgba(36,204,78,0.2)] hover:shadow-[0_0_30px_rgba(36,204,78,0.4)]">
                {loading ? <Loader2 size={20} className="animate-spin text-dark-400" /> : <><Send size={20} /> Enviar Cotação</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
