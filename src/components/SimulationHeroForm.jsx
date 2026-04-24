"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import CityInput from "./CityInput";
import { calculateTransportQuote, MIN_DAILY_RATE } from "@/lib/transportQuote";
import { getAppSettings } from "@/lib/services/appSettings";

export default function SimulationHeroForm() {
  const [tipo, setTipo] = useState("ida_volta");
  const [gasPricePerKm, setGasPricePerKm] = useState(null);
  const [form, setForm] = useState({
    from: "", to: "", fromLat: "", fromLon: "", toLat: "", toLon: "",
    date: "", returnDate: "", passengers: ""
  });
  const [estimate, setEstimate] = useState(null);

  const update = (k, v) => {
    let val = v;
    if (k === "passengers" && v > 15) val = "15";
    setForm((p) => ({ ...p, [k]: val }));
  };

  useEffect(() => {
    let active = true;

    getAppSettings()
      .then((settings) => {
        if (active) setGasPricePerKm(settings.gas_price_per_km);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const hasDates = form.date && (tipo !== "ida_volta" || form.returnDate);
    const hasPassengers = form.passengers && parseInt(form.passengers) > 0;

    if (form.fromLat && form.fromLon && form.toLat && form.toLon && hasDates && hasPassengers) {
      const R = 6371;
      const lat1 = parseFloat(form.fromLat);
      const lon1 = parseFloat(form.fromLon);
      const lat2 = parseFloat(form.toLat);
      const lon2 = parseFloat(form.toLon);
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = (R * c) * 1.3;
      
      const { price } = calculateTransportQuote(distancia, tipo, gasPricePerKm ?? undefined);
      setEstimate(price);
    } else {
      setEstimate(null);
    }
  }, [form.fromLat, form.fromLon, form.toLat, form.toLon, form.date, form.returnDate, form.passengers, tipo, gasPricePerKm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date || !form.passengers) {
      alert("Preencha os campos obrigatórios: origem, destino, data de ida e passageiros.");
      return;
    }
    if (parseInt(form.passengers) > 15) {
      alert("O limite máximo é de 15 passageiros por van.");
      return;
    }

    let distancia = 300;
    if (form.fromLat && form.fromLon && form.toLat && form.toLon) {
      const R = 6371;
      const lat1 = parseFloat(form.fromLat);
      const lon1 = parseFloat(form.fromLon);
      const lat2 = parseFloat(form.toLat);
      const lon2 = parseFloat(form.toLon);
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distancia = (R * c) * 1.3;
    } else {
      const lenHash = form.from.length * 10 + form.to.length * 5;
      distancia = lenHash > 0 ? lenHash * 2.5 : 300;
    }

    const distFormatada = distancia.toFixed(2);
    const { chargedDistance, price: basePrice, hasMinimumDailyRate } = calculateTransportQuote(distancia, tipo, gasPricePerKm ?? undefined);
    const priceFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(basePrice);

    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF();

        const brandColor = [36, 204, 78];
        const darkColor = [20, 20, 20];
        const lightGray = [245, 245, 245];

        doc.setFillColor(...darkColor);
        doc.rect(0, 0, 210, 48, "F");

        doc.setTextColor(...brandColor);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("KLION TOUR", 14, 24);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Fretamento Executivo de Vans", 14, 32);
        doc.setTextColor(200, 200, 200);
        doc.text("kliontour.com.br", 14, 38);

        doc.setTextColor(...brandColor);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ORÇAMENTO PRÉVIO", 196, 24, { align: "right" });

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const dataHoje = new Date().toLocaleDateString("pt-BR");
        doc.text(`Data da Cotação: ${dataHoje}`, 196, 32, { align: "right" });
        const randomId = Math.floor(Math.random() * 90000) + 10000;
        doc.text(`Documento Nº: #${randomId}`, 196, 38, { align: "right" });

        doc.setTextColor(...darkColor);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Dados da Viagem Solicitada", 14, 65);

        doc.setDrawColor(220, 220, 220);
        doc.line(14, 69, 196, 69);

        const tipoLabels = {
          ida_volta: "Ida e Volta",
          in: "Transfer In (Recepção)",
          out: "Transfer Out (Retorno)"
        };

        const distanceStr = tipo === "ida_volta"
          ? `${distFormatada} km (Ida) x2 = ${chargedDistance.toFixed(2)} km`
          : `${distFormatada} km`;

        autoTable(doc, {
          startY: 75,
          head: [["Parâmetro do Fretamento", "Detalhes Informados"]],
          body: [
            ["Serviço Escolhido", tipoLabels[tipo]],
            ["Local de Embarque", form.from],
            ["Local de Desembarque", form.to],
            ["Distância Calculada (Logística)", distanceStr],
            ["Data de Saída", form.date.split("-").reverse().join("/")],
            ...(tipo === "ida_volta" ? [["Data de Retorno", form.returnDate.split("-").reverse().join("/")]] : []),
            ["Quantidade de Passageiros", `${form.passengers} Pessoas`],
          ],
          theme: "grid",
          headStyles: { fillColor: brandColor, textColor: 255, fontSize: 11, fontStyle: "bold" },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 70, fillColor: lightGray },
            1: { cellWidth: "auto" }
          },
          styles: { fontSize: 10, cellPadding: 6, textColor: [50, 50, 50] },
        });

        const finalY = doc.lastAutoTable.finalY || 130;

        doc.setFillColor(248, 250, 248);
        doc.rect(14, finalY + 15, 182, 38, "F");
        doc.setDrawColor(...brandColor);
        doc.setLineWidth(1.5);
        doc.line(14, finalY + 15, 14, finalY + 53);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Investimento Estimado (Deslocamento Premium):", 22, finalY + 28);

        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandColor);
        doc.text(`${priceFormatado}`, 22, finalY + 43);

        doc.setTextColor(130, 130, 130);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const footerLineOne = hasMinimumDailyRate
          ? `Atenção: Para ida e volta, a diária mínima aplicada foi de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(MIN_DAILY_RATE)}.`
          : "Atenção: Este é um orçamento prévio simulado de acordo com a quilometragem calculada por satélite.";
        doc.text(footerLineOne, 105, 272, { align: "center" });
        doc.text("Eventuais alterações de rota, pedágios extras ou paradas podem modificar o valor final.", 105, 277, { align: "center" });

        doc.setTextColor(...darkColor);
        doc.setFont("helvetica", "bold");
        doc.text("Acesse kliontour.com.br e garanta já o seu agendamento!", 105, 285, { align: "center" });

        doc.save(`Orcamento-KlionTour-${randomId}.pdf`);
      });
    });
  };

  const tabs = [
    { id: "ida_volta", label: "Ida e volta" },
    { id: "ida", label: "Somente ida", disabled: true },
    { id: "in", label: "Transfer In" },
    { id: "out", label: "Transfer Out" },
  ];
  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 outline-none transition placeholder:text-white/30";
  const labelStyle = "block text-[10px] tracking-widest uppercase font-bold text-brand-500 mb-1.5 ml-1";

  return (
    <div className="relative group/form">
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-brand-900/20 rounded-[2rem] blur-2xl opacity-0 group-hover/form:opacity-100 transition duration-1000"></div>

      <div className="relative bg-[#0c1220]/60 backdrop-blur-3xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => !t.disabled && setTipo(t.id)}
            disabled={t.disabled}
            className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase font-semibold transition-all duration-300 ${tipo === t.id
              ? "bg-brand-500 text-white shadow-[0_0_20px_rgba(36,204,78,0.3)] scale-105"
              : t.disabled
                ? "bg-white/5 text-white/25 cursor-not-allowed"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            title={t.disabled ? "Opção temporariamente desabilitada" : undefined}
          >
            {t.label}
          </button>
        ))}
        {estimate && (
          <div className="ml-auto hidden sm:flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full animate-in fade-in slide-in-from-right-4 duration-500">
             <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest">Valor Estimado:</span>
             <span className="text-sm font-serif font-medium text-brand-300">R$ {Number(estimate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 w-full text-left">
            <CityInput
              id="hero-from"
              label="Origem"
              labelClassName={labelStyle}
              inputClassName={inputStyle + " pl-10"}
              value={form.from}
              onChange={v => update("from", v)}
              onCoordinateSelect={c => { update("fromLat", c.lat); update("fromLon", c.lon); }}
              placeholder="Saindo de onde?"
            />
          </div>
          <div className="flex-1 w-full text-left">
            <CityInput
              id="hero-to"
              label="Destino"
              labelClassName={labelStyle}
              inputClassName={inputStyle + " pl-10"}
              value={form.to}
              onChange={v => update("to", v)}
              onCoordinateSelect={c => { update("toLat", c.lat); update("toLon", c.lon); }}
              placeholder="Para onde vamos?"
            />
          </div>

          <div className="w-full md:w-40 text-left">
            <label className={labelStyle}>Data Ida</label>
            <input
              type="date"
              value={form.date}
              onChange={e => update("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={inputStyle + " px-3"}
              required
            />
          </div>

          {tipo === "ida_volta" && (
            <div className="w-full md:w-40 text-left shrink-0">
              <label className={labelStyle}>Data Volta</label>
              <input
                type="date"
                value={form.returnDate}
                onChange={e => update("returnDate", e.target.value)}
                min={form.date || new Date().toISOString().split("T")[0]}
                className={inputStyle + " px-3"}
                required={tipo === "ida_volta"}
              />
            </div>
          )}

          <div className="w-full md:w-32 relative text-left">
            <label className={labelStyle}>Passageiros</label>
            <div className="relative">
              <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" />
              <input
                type="number"
                min="1"
                max="15"
                value={form.passengers}
                onChange={e => update("passengers", e.target.value)}
                className={inputStyle + " pl-10"}
                placeholder="Qtd"
                required
              />
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button type="submit" className="btn-primary py-4 px-8 whitespace-nowrap h-[54px] flex items-center justify-center gap-2 w-full text-xs font-bold tracking-widest uppercase">
              <Search size={18} /> Simular
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
