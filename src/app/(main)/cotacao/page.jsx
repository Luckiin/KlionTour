"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CheckCircle, Star, Shield, AlertCircle, Users, FileText } from "lucide-react";
import CityInput from "@/components/CityInput";
import { useAuth } from "@/context/AuthContext";
import { createQuote } from "@/lib/services/quotes";
import { VANS as VANS_CONST } from "@/lib/constants";

const STEPS = ["Rota e Data", "Escolha a Van", "Confirmação"];

export default function CotacaoPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [step, setStep]         = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    from: "", to: "", date: "", returnDate: "", passengers: "", notes: "", vanId: "",
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const pax            = parseInt(form.passengers) || 1;
  const availableVans  = VANS_CONST.filter(v => v.capacity >= pax);
  const selectedVan    = VANS_CONST.find(v => v.id === form.vanId);

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
            <Link href="/auth/entrar"   className="btn-primary">Entrar</Link>
            <Link href="/auth/cadastro" className="btn-outline">Cadastrar</Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-dark-300 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-ink-100 mb-3">Cotação enviada!</h2>
          <p className="text-ink-300 mb-2">
            Sua solicitação foi recebida com sucesso.
          </p>
          <p className="text-ink-300 mb-8">
            Nossa equipe entrará em contato pelo WhatsApp/e-mail em até <strong>2 horas</strong> com o valor oficial e confirmação de disponibilidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/painel" className="btn-primary">Ver Minhas Cotações</Link>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm({ from:"",to:"",date:"",returnDate:"",passengers:"",notes:"",vanId:"" }); }}
              className="btn-outline">Nova Cotação</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createQuote({
        user_id:    user.id,
        user_name:  user.name,
        user_email: user.email,
        user_phone: user.phone ?? null,
        from_city:  form.from,
        to_city:    form.to,
        date:       form.date,
        return_date: form.returnDate || null,
        trip_type:  form.returnDate ? "ida_volta" : "ida",
        passengers: parseInt(form.passengers),
        van_id:     form.vanId,
        van_name:   selectedVan?.name ?? null,
        notes:      form.notes || null,
        status:     "pending",
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar cotação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const canNext = [
    form.from && form.to && form.date && form.passengers,
    form.vanId,
    true,
  ][step];

  return (
    <div className="bg-dark-300 min-h-screen">
      <div className="page-header">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Solicitar Cotação Oficial</h1>
          <p className="text-brand-200">Preencha os dados e receba um orçamento com preço garantido</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16">
        {/* Step Bar */}
        <div className="card px-6 py-5 mb-0 rounded-b-none border-b-0">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                  i < step ? "bg-brand-500 text-white" : i === step ? "bg-brand-500 text-white" : "bg-dark-100 text-ink-400"
                }`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-ink-100" : "text-ink-400"}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-brand-400" : "bg-dark-50"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-t-none border-t-0 shadow-lg px-6 md:px-8 pb-8 pt-7">
          {/* Step 0 - Route */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-ink-100 text-lg mb-4">Dados da viagem</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CityInput id="from" label="Origem *" value={form.from} onChange={v => update("from", v)} placeholder="De onde?" />
                <CityInput id="to"   label="Destino *" value={form.to}   onChange={v => update("to", v)}   placeholder="Para onde?" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-200 mb-1.5">Data de ida *</label>
                  <input type="date" value={form.date} onChange={e => update("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-200 mb-1.5">
                    Data de volta <span className="text-ink-400 font-normal text-xs">(opcional)</span>
                  </label>
                  <input type="date" value={form.returnDate} onChange={e => update("returnDate", e.target.value)}
                    min={form.date} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-200 mb-1.5">Passageiros *</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input type="number" min="1" max="18" value={form.passengers}
                      onChange={e => update("passengers", e.target.value)}
                      className="input-field input-icon" placeholder="Quantidade" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-200 mb-1.5">
                  Observações <span className="text-ink-400 font-normal text-xs">(opcional)</span>
                </label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3}
                  className="input-field resize-none" placeholder="Ex: precisamos de parada, horário de saída preferido, evento especial..." />
              </div>
            </div>
          )}

          {/* Step 1 - Van */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-ink-100 text-lg mb-4">Escolha a van para sua viagem</h2>
              {availableVans.length === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} /> Nenhuma van disponível para {form.passengers} passageiros. Volte e revise.
                </div>
              ) : (
                availableVans.map(van => (
                  <label key={van.id} className={`flex items-start gap-4 border-2 rounded-xl p-4 cursor-pointer transition ${
                    form.vanId === van.id ? "border-brand-500 bg-brand-900/30" : "border-dark-50 hover:border-blue-300 hover:bg-dark-300"
                  }`}>
                    <input type="radio" name="van" value={van.id} checked={form.vanId === van.id}
                      onChange={() => update("vanId", van.id)} className="mt-1 accent-blue-600" />
                    <span className="text-4xl">{van.image}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-ink-100">{van.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star size={13} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{van.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-ink-300">{van.model} · até {van.capacity} lugares</p>
                      <p className="text-sm text-ink-300 mt-1">{van.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {van.features.map(f => (
                          <span key={f} className="text-xs bg-dark-100 text-ink-300 px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          {/* Step 2 - Confirm */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-ink-100 text-lg">Confirme os dados da cotação</h2>
              <div className="bg-dark-300 rounded-xl divide-y">
                {[
                  ["Origem",           form.from],
                  ["Destino",          form.to],
                  ["Data de ida",      new Date(form.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })],
                  form.returnDate && ["Data de volta", new Date(form.returnDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })],
                  ["Passageiros",      `${form.passengers} pessoas`],
                  ["Van escolhida",    selectedVan?.name ?? "–"],
                  form.notes && ["Observações", form.notes],
                  ["Solicitante",      `${user.name} (${user.email})`],
                  ["Telefone",         user.phone],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm px-4 py-3">
                    <span className="text-ink-300">{label}</span>
                    <span className="font-medium text-ink-100 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-brand-900/30 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <FileText size={16} className="inline mr-1.5" />
                Após o envio, nossa equipe analisará sua cotação e entrará em contato com o valor definitivo e disponibilidade. Prazo: até 2 horas.
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t">
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-outline disabled:opacity-30">
              Voltar
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => { if (canNext) setStep(s => s + 1); }}
                disabled={!canNext} className="btn-primary disabled:opacity-40">
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary px-8 disabled:opacity-50">
                {loading ? "Enviando..." : <><CheckCircle size={16} /> Confirmar Cotação</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
