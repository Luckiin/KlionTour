"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, RefreshCw, CheckCircle, Search, Download, Filter, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useMovimentacoes } from "@/lib/hooks/useFinanceiro";
import { toast } from "sonner";
import { fmtBRL, cn } from "@/lib/utils";

export default function Extrato() {
  const [mounted, setMounted] = useState(false);
  
  // Inicialização estável
  const [inicio,  setInicio]  = useState("");
  const [fim,     setFim]     = useState("");
  const [busca,   setBusca]   = useState("");

  useEffect(() => {
    const hoje = new Date();
    const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
    const fimDefault    = hoje.toISOString().split("T")[0];
    setInicio(inicioDefault);
    setFim(fimDefault);
    setMounted(true);
  }, []);

  const { movimentacoes, isLoading, mutate } = useMovimentacoes({
    data_inicio: inicio || undefined,
    data_fim: fim || undefined,
    limit: 1000
  });

  async function conciliar(id, valorAtual) {
    try {
      const res = await fetch(`/api/admin/financeiro/lancamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: valorAtual === 'pago' ? 'pendente' : 'pago' })
      });
      if (!res.ok) throw new Error();
      toast.success(valorAtual === 'pago' ? "Lançamento reaberto" : "Lançamento conciliado");
      mutate();
    } catch {
      toast.error("Erro ao conciliar");
    }
  }

  const filtrados = useMemo(() => {
    return movimentacoes.filter(m => 
      m.descricao.toLowerCase().includes(busca.toLowerCase())
    );
  }, [movimentacoes, busca]);

  const totalEntrada  = filtrados.filter(m => m.tipo === "receita").reduce((s, m) => s + (m.valor || 0), 0);
  const totalSaida    = filtrados.filter(m => m.tipo === "despesa").reduce((s, m) => s + (m.valor || 0), 0);
  const saldoPeriodo  = totalEntrada - totalSaida;

  function exportarPDF() {
    const movsOrdenados = [...filtrados].sort((a, b) => a.data_vencimento > b.data_vencimento ? 1 : -1);
    let saldoAcumulado = 0;

    const BRAND_NAVY = "#19335a";
    const BRAND_BLUE = "#4675c0";
    const BRAND_SKY = "#8fc8eb";
    const BRAND_BG = "#f0f4f8";

    const linhas = movsOrdenados.map((m, i) => {
      const entrada = m.tipo === "receita" ? (m.valor || 0) : 0;
      const saida = m.tipo === "despesa" ? (m.valor || 0) : 0;
      saldoAcumulado += (entrada - saida);
      const corSaldo = saldoAcumulado >= 0 ? "#15803d" : "#b91c1c";
      const isPago = m.status === 'pago';
      
      return `
        <tr style="background:${i % 2 === 0 ? BRAND_BG : "#ffffff"}">
          <td style="padding: 8px;">${new Date(m.data_vencimento).toLocaleDateString("pt-BR")}</td>
          <td style="padding: 8px;">
            <div style="font-weight:700">${m.descricao || "—"}</div>
            <div style="font-size:8px; color: #64748b; text-transform: uppercase;">${m.categorias_financeiras?.nome || "—"}</div>
          </td>
          <td style="color:#15803d;text-align:right;padding: 8px;">${entrada > 0 ? fmtBRL(entrada) : "—"}</td>
          <td style="color:#b91c1c;text-align:right;padding: 8px;">${saida > 0 ? fmtBRL(saida) : "—"}</td>
          <td style="color:${corSaldo};text-align:right;font-weight:700;padding: 8px;">${fmtBRL(saldoAcumulado)}</td>
          <td style="text-align:center;color:${isPago ? "#15803d" : "#9ca3af"};padding: 8px;">${isPago ? "&#10003;" : "&#9675;"}</td>
        </tr>`;
    }).join("");

    const hoje = new Date();
    const dataGeracao = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const periodoFmt = `${new Date(inicio + "T12:00:00").toLocaleDateString("pt-BR")} a ${new Date(fim + "T12:00:00").toLocaleDateString("pt-BR")}`;
    const numExtrato = `EXT-${Date.now().toString().slice(-6)}`;
    const corSaldoFinal = saldoPeriodo >= 0 ? "#15803d" : "#b91c1c";

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Extrato — KlionTour</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;font-size:11px;color:#1e293b;background:#fff}
    .page{width:210mm;min-height:297mm;padding:14mm 14mm 10mm;margin:0 auto}
    /* Cabecalho */
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:3px solid ${BRAND_NAVY};margin-bottom:14px}
    .company-name{font-size:20px;font-weight:700;color:${BRAND_NAVY}}
    .company-slogan{font-size:10px;color:${BRAND_BLUE};margin-top:3px;font-style:italic}
    .stmt-title{font-size:24px;font-weight:700;color:${BRAND_NAVY};text-align:right;letter-spacing:-.5px}
    .gold-bar{width:56px;height:2px;background:linear-gradient(90deg,${BRAND_BLUE},${BRAND_SKY});margin-top:4px;margin-left:auto}
    /* Meta info */
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
    .meta-box{border:1px solid rgba(25,51,90,.2);overflow:hidden}
    .section-hdr{background:${BRAND_NAVY};color:${BRAND_SKY};font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px}
    .meta-row{display:flex;justify-content:space-between;font-size:10.5px;padding:4px 10px;border-bottom:1px solid rgba(25,51,90,.08)}
    .meta-row:last-child{border-bottom:none}
    .meta-label{color:#64748b}
    .meta-value{font-weight:600;color:#1e293b}
    /* Tabela */
    table{width:100%;border-collapse:collapse;font-size:10px}
    thead tr{background:${BRAND_NAVY}}
    thead th{padding:7px 8px;text-align:left;font-weight:600;font-size:10px;letter-spacing:.05em;color:${BRAND_SKY}}
    tbody td{padding:6px 8px;border-bottom:1px solid rgba(25,51,90,.08);vertical-align:middle;color:#1e293b}
    tfoot td{padding:8px;font-weight:700;font-size:11px;background:#0f172a;color:${BRAND_SKY}}
    /* Rodape */
    .footer{margin-top:20px;border-top:3px solid ${BRAND_BLUE};padding-top:12px;text-align:center}
    .footer-h{font-size:13px;font-weight:700;color:${BRAND_NAVY};margin-bottom:4px}
    .footer-t{font-size:9px;color:#64748b;line-height:1.6}
    .footer-c{font-size:9px;color:#475569;margin-top:6px;padding-top:6px;border-top:1px solid rgba(70,117,192,.3)}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:10mm}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">KlionTour</div>
      <div class="company-slogan">Excelência em Fretamento e Turismo</div>
    </div>
    <div>
      <div class="stmt-title">Extrato</div>
      <div class="gold-bar"></div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <div class="section-hdr">Informações do Extrato</div>
      <div class="meta-row"><span class="meta-label">Data de Emissão</span><span class="meta-value">${dataGeracao}</span></div>
      <div class="meta-row"><span class="meta-label">Nº do Extrato</span><span class="meta-value">${numExtrato}</span></div>
      <div class="meta-row"><span class="meta-label">Período</span><span class="meta-value">${periodoFmt}</span></div>
      <div class="meta-row"><span class="meta-label">Filtro</span><span class="meta-value">${busca || 'Todos'}</span></div>
    </div>
    <div class="meta-box">
      <div class="section-hdr">Resumo do Período</div>
      <div class="meta-row"><span class="meta-label">Total de Entradas</span><span class="meta-value" style="color:#15803d">${fmtBRL(totalEntrada)}</span></div>
      <div class="meta-row"><span class="meta-label">Total de Saídas</span><span class="meta-value" style="color:#b91c1c">${fmtBRL(totalSaida)}</span></div>
      <div class="meta-row"><span class="meta-label">Nº de Movimentações</span><span class="meta-value">${filtrados.length}</span></div>
      <div class="meta-row"><span class="meta-label" style="font-weight:700">Saldo do Período</span><span class="meta-value" style="color:${corSaldoFinal};font-size:13px">${fmtBRL(saldoPeriodo)}</span></div>
    </div>
  </div>

  <div class="section-hdr">Movimentações Detalhadas</div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%">Data</th>
        <th style="width: 40%">Descrição</th>
        <th style="text-align:right; width: 15%">Entrada</th>
        <th style="text-align:right; width: 15%">Saída</th>
        <th style="text-align:right; width: 15%">Saldo</th>
        <th style="text-align:center; width: 5%">Conc.</th>
      </tr>
    </thead>
    <tbody>
      ${linhas || `<tr><td colspan="6" style="text-align:center;padding:20px;color:#9ca3af">Nenhuma movimentação no período.</td></tr>`}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">Total Geral do Período</td>
        <td style="text-align:right;color:#86efac">${fmtBRL(totalEntrada)}</td>
        <td style="text-align:right;color:#fca5a5">${fmtBRL(totalSaida)}</td>
        <td style="text-align:right;color:${saldoPeriodo >= 0 ? "#86efac" : "#fca5a5"}">${fmtBRL(saldoPeriodo)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <div class="footer-h">Saldo do Período: ${fmtBRL(saldoPeriodo)}</div>
    <div class="footer-t">
      Este extrato foi gerado automaticamente pelo sistema KlionTour e é válido como documento de controle interno.
    <div class="footer-c">
      KlionTour &mdash; Gestão de Fretamento &nbsp;|&nbsp;
      Gerado em: ${hoje.toLocaleString("pt-BR")} &nbsp;|&nbsp;
      Ref: ${numExtrato}
    </div>
  </div>
</div>
</body>
</html>`;

    const janela = window.open("", "_blank", "width=900,height=700");
    if (!janela) { 
      toast.error("Habilite popups no navegador para exportar o PDF."); 
      return; 
    }
    janela.document.write(html);
    janela.document.close();
    // Pequeno delay para carregar as fontes e estilos antes de imprimir
    janela.onload = () => setTimeout(() => {
      janela.print();
      // janela.close(); // Opcional: fechar após imprimir
    }, 500);
  }

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-brand-500" /> Extrato e Conciliação
          </h1>
          <p className="text-sm text-steel-500 mt-1">Histórico completo de movimentações financeiras</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => mutate()} className="p-3 rounded-2xl bg-surface-subtle dark:bg-surface-dark-subtle border border-surface-border dark:border-surface-dark-border text-steel-500 hover:text-brand-900 transition-all">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={exportarPDF}
            disabled={isLoading || filtrados.length === 0}
            className="btn-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-[2rem] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2 block ml-1">Data Início</label>
          <input type="date" className="input-field" value={inicio} onChange={e => setInicio(e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2 block ml-1">Data Fim</label>
          <input type="date" className="input-field" value={fim} onChange={e => setFim(e.target.value)} />
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-[3.25rem] -translate-y-1/2 text-steel-400" />
          <label className="text-[10px] font-black text-steel-500 uppercase tracking-widest mb-2 block ml-1">Buscar</label>
          <input type="text" className="input-field pl-12" placeholder="Palavra-chave..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Entradas", v: fmtBRL(totalEntrada),  c: "text-emerald-500", bg: "bg-emerald-500/5" },
          { l: "Saídas",   v: fmtBRL(totalSaida),    c: "text-red-500", bg: "bg-red-500/5" },
          { l: "Saldo Período", v: fmtBRL(saldoPeriodo),  c: saldoPeriodo >= 0 ? "text-emerald-500" : "text-red-500", bg: "bg-surface-subtle" },
          { l: "Registros", v: filtrados.length, c: "text-neutral-500", bg: "bg-surface-subtle" },
        ].map(c => (
          <div key={c.l} className={cn("glass-card border-none rounded-2xl p-5 flex flex-col justify-center", c.bg)}>
            <p className="text-[10px] font-bold text-steel-500 uppercase tracking-widest mb-1">{c.l}</p>
            <p className={cn("text-2xl font-serif font-medium", c.c)}>{c.v}</p>
          </div>
        ))}
      </div>

      {/* Tabela Literal */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-subtle/30 dark:bg-surface-dark-subtle/10 border-b border-surface-border dark:border-surface-dark-border">
                {["Data", "Descrição", "Entrada", "Saída", "Status", ""].map(h => (
                  <th key={h} className="p-6 text-[10px] font-black uppercase tracking-widest text-steel-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-20 text-center"><RefreshCw size={32} className="animate-spin text-brand-500 mx-auto" /></td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-xs font-bold text-steel-400 uppercase tracking-widest">Sem movimentação no período</td></tr>
              ) : (
                filtrados.map(m => {
                  const isEntrada = m.tipo === 'receita';
                  const isPago    = m.status === 'pago';
                  return (
                    <tr key={m.id} className="table-row-hover transition-all">
                      <td className="p-6 text-[11px] font-bold text-steel-500 whitespace-nowrap">{new Date(m.data_vencimento).toLocaleDateString()}</td>
                      <td className="p-6">
                        <p className="font-bold text-brand-900 dark:text-white">{m.descricao}</p>
                        <p className="text-[10px] text-steel-500 font-bold uppercase tracking-widest">{m.categorias_financeiras?.nome || '—'}</p>
                      </td>
                      <td className="p-6 font-black text-sm text-emerald-500">{isEntrada ? fmtBRL(m.valor) : "—"}</td>
                      <td className="p-6 font-black text-sm text-red-500">{!isEntrada ? fmtBRL(m.valor) : "—"}</td>
                      <td className="p-6">
                        <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          isPago ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {isPago ? "Conciliado" : "Pendente"}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => conciliar(m.id, m.status)}
                          className={cn("w-8 h-8 flex items-center justify-center rounded-xl border-2 transition-all",
                            isPago ? "bg-brand-500 border-brand-500 text-white" : "border-surface-border dark:border-surface-dark-border text-steel-400 hover:border-brand-500 hover:text-brand-500"
                          )}>
                          <CheckCircle size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
