"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Plus, Search, ChevronDown, CheckCircle,
  Trash2, Users, Wrench, Shield, BarChart2, Loader2,
} from "lucide-react";
import { getVeiculos, createVeiculo, deactivateVeiculo } from "@/lib/services/veiculos";
import Reveal from "@/components/motion/Reveal";

// ── Helpers ─────────────────────────────────────────────
const MONEY = (v) => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const maskPlaca   = (v = "") => v.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,7).replace(/^([A-Z]{3})(\d.*)$/,"$1-$2");
const maskPhone   = (v = "") => v.replace(/\D/g,"").replace(/(\d{2})(\d{1})(\d{4})(\d{4})/,"($1) $2 $3-$4").slice(0,16);
const maskMoney   = (v = "") => {
  const nums = v.replace(/\D/g,"");
  if (!nums) return "";
  const val = (parseInt(nums,10)/100).toFixed(2);
  return "R$ " + val.replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".");
};
const parseMoney  = (v = "") => parseFloat(v.replace(/[R$\s.]/g,"").replace(",",".")) || 0;
const maskRenavam = (v = "") => v.replace(/\D/g,"").slice(0,11);
const maskAno     = (v = "") => v.replace(/\D/g,"").slice(0,4);

const MARCAS = ["Mercedes-Benz","Iveco","Renault","Volkswagen","Ford","Fiat","Citroën","Peugeot","Sprinter","Outros"];
const CORES  = ["Branco","Prata","Preto","Cinza","Azul","Vermelho","Amarelo","Verde","Laranja"];

const EMPTY_FORM = {
  placa:"", modelo:"", marca:"", ano:"", chassi:"", renavam:"",
  valorSeguro:"", valorVeiculo:"", cor:"", quantidadeMaximaPassageiros:"",
  terceirizado: false, cpfCnpj:"", proprietario:"", telefone:"",
  // Vistorias
  valorVistoria:"", valorLicenciamento:"", gtxVistoria:"", renovacaoSimplificada:"",
  // Ficha Técnica
  mediaKmRodadoMes:"", revisaoVeiculo:"", pneusVeiculo:"",
  combustivelPorLitro:"", lavagem:"", manutencaoVeiculo:"",
  alinhamentoPneu:"", balanceamento:"",
};

function Field({ label, children, col = "md:col-span-1" }) {
  return (
    <div className={col}>
      <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className="input-field text-sm disabled:opacity-40 disabled:cursor-not-allowed" />
  );
}

function MoneyInput({ value, onChange, placeholder }) {
  return (
    <input type="text" value={value}
      onChange={e => onChange(maskMoney(e.target.value))}
      placeholder={placeholder || "R$ 0,00"}
      className="input-field text-sm" />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field text-sm">
      <option value="">Selecione...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Section({ title, icon, children, cols = 2 }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-dark-50" />
        <span className="text-sm font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2">
          {icon} {title}
        </span>
        <div className="flex-1 h-px bg-dark-50" />
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
        {children}
      </div>
    </div>
  );
}

function VehicleCard({ v, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`card overflow-hidden transition-all duration-300 ${open ? "ring-2 ring-brand-500/20 shadow-soft-lg" : ""}`}>
      <div 
        className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${open ? "bg-brand-500/5" : "hover:bg-brand-500/5 dark:hover:bg-brand-300/5 text-brand-900 dark:text-white"}`} 
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
            <Car size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-brand-900 dark:text-white flex items-center gap-2">
              {v.marca} {v.modelo} 
              <span className="px-2 py-0.5 rounded-lg bg-surface-subtle dark:bg-surface-dark-subtle text-steel-500 dark:text-steel-400 text-[10px] font-bold tracking-widest uppercase border border-surface-border dark:border-surface-dark-border">
                {v.placa}
              </span>
            </p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-steel-400 mt-1 flex items-center gap-2">
              {v.ano} · {v.cor} · {v.quantidade_maxima_passageiros} passageiros
              {v.terceirizado && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black"><Shield size={10} /> Terceirizado</span>}
            </p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${open ? "bg-brand-500 text-white rotate-180" : "bg-steel-100 dark:bg-steel-800 text-steel-400 group-hover:bg-brand-500 group-hover:text-white"}`}>
          <ChevronDown size={14} />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-surface-border dark:border-surface-dark-border"
          >
            <div className="p-6 space-y-8 bg-white/50 dark:bg-surface-dark-elevated/50 backdrop-blur-sm">
              {/* Identificação Geral */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  ["Chassi",   v.chassi],
                  ["Renavam",  v.renavam],
                  ["Val. Aeronave", v.valor_veiculo ? MONEY(v.valor_veiculo) : null],
                  ["Seguro Anual",  v.valor_seguro ? MONEY(v.valor_seguro) : null],
                ].map(([k,val]) => (
                  <div key={k}>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">{k}</span>
                    <p className="text-sm font-bold text-brand-900 dark:text-white">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Vistorias Agerba */}
              <div className="p-5 rounded-2xl bg-surface-subtle/50 dark:bg-surface-dark-subtle/30 border border-surface-border dark:border-surface-dark-border">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-brand-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-900 dark:text-white">Taxas e Vistorias</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    ["Vistoria Agerba",     v.valor_vistoria ? MONEY(v.valor_vistoria) : null],
                    ["Licenciamento",       v.valor_licenciamento ? MONEY(v.valor_licenciamento) : null],
                    ["GTX Vistoria",        v.gtx_vistoria ? MONEY(v.gtx_vistoria) : null],
                    ["Renovação Simpl.",    v.renovacao_simplificada ? MONEY(v.renovacao_simplificada) : null],
                  ].map(([k,val]) => (
                    <div key={k}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">{k}</span>
                      <p className="text-xs font-bold text-brand-900 dark:text-white">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ficha Técnica e Operacional */}
              <div>
                <div className="flex items-center gap-2 mb-4 ml-1">
                  <BarChart2 size={14} className="text-brand-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-900 dark:text-white">Indicadores e Manutenção</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6">
                  {[
                    ["KM/mês Médio",           v.media_km_rodado_mes ? `${v.media_km_rodado_mes} km` : "—"],
                    ["Eficiência Combustível", v.combustivel_por_litro ? `${v.combustivel_por_litro} km/l` : "—"],
                    ["Revisão Preventiva", v.revisao_veiculo ? MONEY(v.revisao_veiculo) : null],
                    ["Troca de Pneus",   v.pneus_veiculo ? MONEY(v.pneus_veiculo) : null],
                    ["Manutenção Geral",   v.manutencao_veiculo ? MONEY(v.manutencao_veiculo) : null],
                    ["Lavagem Técnica",          v.lavagem ? MONEY(v.lavagem) : null],
                    ["Alinhamento",      v.alinhamento_pneu ? MONEY(v.alinhamento_pneu) : null],
                    ["Balanceamento",    v.balanceamento ? MONEY(v.balanceamento) : null],
                  ].map(([k,val]) => (
                    <div key={k}>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">{k}</span>
                      <p className="text-xs font-bold text-brand-900 dark:text-white">{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {v.terceirizado && (
                <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                       <Users size={16} className="text-amber-600 dark:text-amber-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Proprietário Parceiro</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">CPF/CNPJ</span>
                        <p className="text-xs font-bold text-brand-900 dark:text-white">{v.cpf_cnpj_proprietario || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">Titular</span>
                        <p className="text-xs font-bold text-brand-900 dark:text-white truncate">{v.proprietario || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">Telefone</span>
                        <p className="text-xs font-bold text-brand-900 dark:text-white">{v.telefone_proprietario || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-surface-border dark:border-surface-dark-border">
                <button onClick={() => onDelete(v.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={13} /> Desativar Veículo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VeiculosPage() {
  const [tab,      setTab]      = useState("lista");
  const [veiculos, setVeiculos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    getVeiculos({ apenasAtivos: false })
      .then(setVeiculos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = veiculos.filter(v =>
    !search ||
    v.placa?.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(search.toLowerCase()) ||
    v.marca?.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.placa)   e.placa   = "Obrigatório";
    if (!form.modelo)  e.modelo  = "Obrigatório";
    if (!form.marca)   e.marca   = "Obrigatório";
    if (!form.ano || form.ano.length < 4) e.ano = "Ano inválido";
    if (!form.quantidadeMaximaPassageiros) e.qtd = "Obrigatório";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const novo = await createVeiculo({
        placa:                        form.placa.replace(/-/g,""),
        modelo:                       form.modelo,
        marca:                        form.marca,
        ano:                          parseInt(form.ano) || null,
        chassi:                       form.chassi || null,
        renavam:                      form.renavam || null,
        cor:                          form.cor || null,
        quantidade_maxima_passageiros: parseInt(form.quantidadeMaximaPassageiros) || null,
        valor_seguro:                 parseMoney(form.valorSeguro) || null,
        valor_veiculo:                parseMoney(form.valorVeiculo) || null,
        terceirizado:                 form.terceirizado,
        cpf_cnpj_proprietario:        form.cpfCnpj || null,
        proprietario:                 form.proprietario || null,
        telefone_proprietario:        form.telefone || null,
        valor_vistoria:               parseMoney(form.valorVistoria) || null,
        valor_licenciamento:          parseMoney(form.valorLicenciamento) || null,
        gtx_vistoria:                 parseMoney(form.gtxVistoria) || null,
        renovacao_simplificada:       parseMoney(form.renovacaoSimplificada) || null,
        media_km_rodado_mes:          parseMoney(form.mediaKmRodadoMes) || null,
        revisao_veiculo:              parseMoney(form.revisaoVeiculo) || null,
        pneus_veiculo:                parseMoney(form.pneusVeiculo) || null,
        combustivel_por_litro:        parseMoney(form.combustivelPorLitro) || null,
        lavagem:                      parseMoney(form.lavagem) || null,
        manutencao_veiculo:           parseMoney(form.manutencaoVeiculo) || null,
        alinhamento_pneu:             parseMoney(form.alinhamentoPneu) || null,
        balanceamento:                parseMoney(form.balanceamento) || null,
        ativo:                        true,
      });
      setVeiculos(p => [novo, ...p]);
      setForm(EMPTY_FORM);
      setErrors({});
      setSuccess(true);
      setTab("lista");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Reveal direction="down">
            <h1 className="text-3xl font-serif font-medium text-brand-900 dark:text-white">Veículos</h1>
            <p className="text-steel-500 dark:text-steel-400 text-sm mt-1">Gestão da frota própria e terceirizada KlionTour</p>
          </Reveal>
        </div>
        <button onClick={() => setTab(tab === "cadastro" ? "lista" : "cadastro")}
          className={tab === "cadastro" ? "btn-outline py-3 px-6" : "btn-primary py-3 px-6"}>
          {tab === "cadastro" ? "← Voltar à lista" : <><Plus size={18} /> Cadastrar Veículo</>}
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest">
          <CheckCircle size={18} /> Veículo cadastrado com sucesso!
        </motion.div>
      )}

      {/* ── LISTA ──────────────────────────────────── */}
      {tab === "lista" && (
        <div className="space-y-6">
          <div className="card p-6 group focus-within:ring-4 focus-within:ring-brand-500/5 transition-all">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field input-icon" placeholder="Buscar por placa, modelo ou marca da aeronave/veículo..." />
            </div>
          </div>
          
          {loading ? (
            <div className="card p-24 flex flex-col items-center justify-center border-dashed">
              <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
              <p className="text-sm font-bold text-steel-500 uppercase tracking-widest">Carregando Frota...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-24 text-center border-dashed opacity-60">
              <Car size={48} className="text-steel-300 dark:text-steel-600 mx-auto mb-4" />
              <h4 className="font-serif text-2xl text-brand-900 dark:text-white mb-2">Nenhum veículo</h4>
              <p className="text-steel-500 mb-6">Não encontramos veículos registrados ou ativos.</p>
              <button onClick={() => setTab("cadastro")} className="btn-primary py-3 px-8 text-xs font-bold uppercase tracking-widest mx-auto">
                <Plus size={16} /> Cadastrar Primeiro Veículo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((v, i) => (
                <Reveal key={v.id} direction="up" delay={i * 0.03}>
                  <VehicleCard v={v}
                    onDelete={async (id) => {
                      if(!confirm("Deseja realmente remover este veículo?")) return;
                      try {
                        await deactivateVeiculo(id);
                        setVeiculos(p => p.filter(x => x.id !== id));
                      } catch (err) { alert(err.message); }
                    }} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CADASTRO ───────────────────────────────── */}
      {tab === "cadastro" && (
        <div className="card overflow-hidden">
          <div className="p-8 border-b border-surface-border dark:border-surface-dark-border bg-surface-subtle/30 dark:bg-surface-dark-subtle/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Car size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-brand-900 dark:text-white">Novo Veículo</h2>
              <p className="text-xs text-steel-500 dark:text-steel-400 mt-0.5">Informe os dados técnicos e operacionais abaixo</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Field label="Placa *" col="md:col-span-1">
                <Input value={form.placa} onChange={v => upd("placa", maskPlaca(v))} placeholder="AAA-0000" />
                {errors.placa && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.placa}</p>}
              </Field>
              <Field label="Modelo *" col="md:col-span-1">
                <Input value={form.modelo} onChange={v => upd("modelo", v)} placeholder="Ex: Sprinter 415" />
                {errors.modelo && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.modelo}</p>}
              </Field>
              <Field label="Marca *" col="md:col-span-1">
                <Select value={form.marca} onChange={v => upd("marca", v)} options={MARCAS} />
                {errors.marca && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.marca}</p>}
              </Field>
              <Field label="Ano *" col="md:col-span-1">
                <Input value={form.ano} onChange={v => upd("ano", maskAno(v))} placeholder="2024" />
                {errors.ano && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.ano}</p>}
              </Field>
              <Field label="Chassi" col="md:col-span-2">
                <Input value={form.chassi} onChange={v => upd("chassi", v.toUpperCase().slice(0,17))} placeholder="17 caracteres" />
              </Field>
              <Field label="Renavam" col="md:col-span-2">
                <Input value={form.renavam} onChange={v => upd("renavam", maskRenavam(v))} placeholder="Número do Renavam" />
              </Field>
              <Field label="Cor">
                <Select value={form.cor} onChange={v => upd("cor", v)} options={CORES} />
              </Field>
              <Field label="Capacidade Passoageiros *">
                <Input type="number" value={form.quantidadeMaximaPassageiros}
                  onChange={v => upd("quantidadeMaximaPassageiros", v)} placeholder="15" />
                {errors.qtd && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.qtd}</p>}
              </Field>
              <Field label="Val. Veículo (R$)">
                <MoneyInput value={form.valorVeiculo} onChange={v => upd("valorVeiculo", v)} />
              </Field>
              <Field label="Seguro Anual (R$)">
                <MoneyInput value={form.valorSeguro} onChange={v => upd("valorSeguro", v)} />
              </Field>
            </div>

            {/* Terceirizado */}
            <div className="mt-10 py-6 border-t border-surface-border dark:border-surface-dark-border">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div onClick={() => upd("terceirizado", !form.terceirizado)}
                  className={`w-14 h-8 rounded-full transition-all relative p-1 ${form.terceirizado ? "bg-brand-500 shadow-lg shadow-brand-500/30" : "bg-steel-200 dark:bg-steel-800"}`}>
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${form.terceirizado ? "translate-x-6" : "translate-x-0"}`} />
                </div>
                <div>
                  <span className="text-sm font-bold text-brand-900 dark:text-white block">Veículo Terceirizado</span>
                  <p className="text-[10px] text-steel-500 dark:text-steel-400 uppercase tracking-widest mt-0.5">Selecione se o parceiro for o dono do veículo</p>
                </div>
              </label>
            </div>

            {form.terceirizado && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-6 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-[0.2em] mb-4">Dados do Proprietário Parceiro</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="CPF / CNPJ">
                    <Input value={form.cpfCnpj} onChange={v => upd("cpfCnpj", v)} placeholder="Documento do titular" />
                  </Field>
                  <Field label="Nome / Razão Social">
                    <Input value={form.proprietario} onChange={v => upd("proprietario", v)} placeholder="Proprietário legal" />
                  </Field>
                  <Field label="Telefone de Contato">
                    <Input value={form.telefone} onChange={v => upd("telefone", maskPhone(v))} placeholder="(00) 0 0000-0000" />
                  </Field>
                </div>
              </motion.div>
            )}

            {/* Vistorias */}
            <Section title="Vistorias e Taxas Agerba" icon={<Shield size={16} />} cols={2}>
              <Field label="Taxa de Vistoria (R$)">
                <MoneyInput value={form.valorVistoria} onChange={v => upd("valorVistoria", v)} />
              </Field>
              <Field label="Licenciamento Anual (R$)">
                <MoneyInput value={form.valorLicenciamento} onChange={v => upd("valorLicenciamento", v)} />
              </Field>
              <Field label="GTX Vistoria (R$)">
                <MoneyInput value={form.gtxVistoria} onChange={v => upd("gtxVistoria", v)} />
              </Field>
              <Field label="Taxa Renovação Simpl. (R$)">
                <MoneyInput value={form.renovacaoSimplificada} onChange={v => upd("renovacaoSimplificada", v)} />
              </Field>
            </Section>

            {/* Ficha Técnica */}
            <Section title="Manutenção e Desempenho" icon={<BarChart2 size={16} />} cols={2}>
              <Field label="Média rodada (km/mês)">
                <Input type="number" value={form.mediaKmRodadoMes}
                  onChange={v => upd("mediaKmRodadoMes", v)} placeholder="Ex: 8000" />
              </Field>
              <Field label="Consumo médio (km/l)">
                <Input type="number" value={form.combustivelPorLitro}
                  onChange={v => upd("combustivelPorLitro", v)} placeholder="Ex: 10" />
              </Field>
              <Field label="Custo Revisão 20k km (R$)">
                <MoneyInput value={form.revisaoVeiculo} onChange={v => upd("revisaoVeiculo", v)} />
              </Field>
              <Field label="Custo Pneus 60k km (R$)">
                <MoneyInput value={form.pneusVeiculo} onChange={v => upd("pneusVeiculo", v)} />
              </Field>
              <Field label="Manutenção Corretiva Est. (R$)">
                <MoneyInput value={form.manutencaoVeiculo} onChange={v => upd("manutencaoVeiculo", v)} />
              </Field>
              <Field label="Custo Médio Lavagem (R$)">
                <MoneyInput value={form.lavagem} onChange={v => upd("lavagem", v)} />
              </Field>
              <Field label="Alinhamento/Balanceamento (R$)">
                <MoneyInput value={form.alinhamentoPneu} onChange={v => upd("alinhamentoPneu", v)} />
              </Field>
            </Section>

            {/* Ações */}
            <div className="flex gap-4 mt-12 pt-8 border-t border-surface-border dark:border-surface-dark-border">
              <button onClick={handleSave} disabled={saving} className="btn-primary py-4 px-10 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                {saving ? "Processando..." : <><CheckCircle size={18} /> Salvar Veículo</>}
              </button>
              <button onClick={() => { if(confirm("Limpar formulário?")) { setForm(EMPTY_FORM); setErrors({}); } }} className="btn-outline py-4 px-8 text-xs font-bold uppercase tracking-widest">
                Limpar Campos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
