"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import CityInput from "./CityInput";

export default function SimulationHeroForm() {
  const router = useRouter();
  const [tipo, setTipo] = useState("ida_volta"); // ida_volta, ida, in, out
  const [form, setForm] = useState({
    from: "", to: "", fromLat: "", fromLon: "", toLat: "", toLon: "",
    date: "", returnDate: "", passengers: ""
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date || !form.passengers) {
      alert("Preencha os campos obrigatórios: origem, destino, data de ida e passageiros.");
      return;
    }

    // Calcula Distância Grátis
    let distancia = 300;
    if (form.fromLat && form.fromLon && form.toLat && form.toLon) {
      const R = 6371;
      const lat1 = parseFloat(form.fromLat); const lon1 = parseFloat(form.fromLon);
      const lat2 = parseFloat(form.toLat); const lon2 = parseFloat(form.toLon);
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
    console.log('distancia dessa viagem', distFormatada + ' km');

    // Mates de preço
    let basePrice = 0;
    
    if (tipo === "ida_volta") {
      // Regra 1: Ida e Volta -> Distância x2 -> OKm custa 5 reais -> Diária mínima 1000
      const distTotal = distancia * 2;
      let calcPrice = distTotal * 5;
      basePrice = calcPrice < 1000 ? 1000 : calcPrice;
      
    } else if (tipo === "in" || tipo === "out") {
      // Regra 2: Transfers In/Out -> Okm custa 7.50 reais
      basePrice = distancia * 7.50;
      
    } else {
      // Fallback
      basePrice = distancia * 5; 
    }

    const priceFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(basePrice);

    // Gerar PDF direto (Design Profissional Premium)
    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF();
        
        // Cores da Marca
        const brandColor = [36, 204, 78]; // Verde da Klion
        const darkColor = [20, 20, 20];
        const lightGray = [245, 245, 245];
        
        // Cabeçalho (Fundo Escuro Premium)
        doc.setFillColor(...darkColor);
        doc.rect(0, 0, 210, 48, "F");
        
        // Marca Klion Tour
        doc.setTextColor(...brandColor);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("KLION TOUR", 14, 24);
        
        // Slogan / Site
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("Fretamento Executivo de Vans", 14, 32);
        doc.setTextColor(200, 200, 200);
        doc.text("kliontour.com.br", 14, 38);
        
        // Detalhes a Direita (Data e Tag Orçamento)
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
        
        // Titulo da Tabela
        doc.setTextColor(...darkColor);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Dados da Viagem Solicitada", 14, 65);
        
        // Linha divisória
        doc.setDrawColor(220, 220, 220);
        doc.line(14, 69, 196, 69);
        
        const tipoLabels = {
          ida_volta: "Ida e Volta",
          in: "Transfer In (Recepção)",
          out: "Transfer Out (Retorno)"
        };
        
        // Se for ida_volta, formata a distancia visualmente
        const distanceStr = tipo === "ida_volta" 
          ? `${distFormatada} km (Ida) x2 = ${(distancia * 2).toFixed(2)} km` 
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
        
        // Bloco de Preço Final Premium
        doc.setFillColor(248, 250, 248); // Fundo sutilmente esverdeado
        doc.rect(14, finalY + 15, 182, 38, "F");
        doc.setDrawColor(...brandColor);
        doc.setLineWidth(1.5);
        doc.line(14, finalY + 15, 14, finalY + 53); // Linha Lateral de destaque
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Investimento Estimado (Deslocamento Premium):", 22, finalY + 28);
        
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brandColor);
        doc.text(`${priceFormatado}`, 22, finalY + 43);
        
        // Footer Notes 
        doc.setTextColor(130, 130, 130);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Atenção: Este é um orçamento prévio simulado de acordo com a quilometragem calculada por satélite.", 105, 272, { align: "center" });
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
    { id: "in", label: "Transfer In" },
    { id: "out", label: "Transfer Out" },
  ];

  return (
    <div className="glass p-6 md:p-8 rounded-3xl shadow-soft-lg w-full max-w-7xl mx-auto">
      {/* Radio Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTipo(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${tipo === t.id
              ? "bg-brand-500 text-white shadow-soft"
              : "bg-brand-500/5 text-brand-900 dark:text-white/80 hover:bg-brand-500/15"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-1 w-full text-left">
            <CityInput
              id="hero-from"
              label="Origem"
              value={form.from}
              onChange={v => update("from", v)}
              onCoordinateSelect={c => { update("fromLat", c.lat); update("fromLon", c.lon); }}
              placeholder="De onde?"
            />
          </div>
          <div className="flex-1 w-full text-left">
            <CityInput
              id="hero-to"
              label="Destino"
              value={form.to}
              onChange={v => update("to", v)}
              onCoordinateSelect={c => { update("toLat", c.lat); update("toLon", c.lon); }}
              placeholder="Para onde?"
            />
          </div>

          <div className="w-full md:w-36 text-left">
            <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1">Ida</label>
            <input type="date" value={form.date} onChange={e => update("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="input-field w-full px-2" required />
          </div>

          {tipo === "ida_volta" && (
            <div className="w-full md:w-36 text-left shrink-0">
              <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1">Volta</label>
              <input type="date" value={form.returnDate} onChange={e => update("returnDate", e.target.value)}
                min={form.date || new Date().toISOString().split("T")[0]}
                className="input-field w-full px-2" required={tipo === "ida_volta"} />
            </div>
          )}

          <div className="w-full md:w-32 relative text-left">
            <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1">Qtd Passageiros</label>
            <div className="relative">
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-500" />
              <input type="number" min="1" max="15" value={form.passengers}
                onChange={e => update("passengers", e.target.value)}
                className="input-field w-full pl-9 pr-2" placeholder="Qtd." required />
            </div>
          </div>

          <div className="w-full md:w-auto mt-6">
            <button type="submit" className="btn-primary py-2.5 px-6 whitespace-nowrap h-[42px] flex items-center justify-center gap-2 w-full">
              <Search size={18} /> Gerar Cotação
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
