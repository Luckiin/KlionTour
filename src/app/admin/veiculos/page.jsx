"use client";

import { useState, useEffect } from "react";
import {
  Car, Plus, Search, ChevronDown, CheckCircle,
  Trash2, Users, Wrench, Shield, BarChart2, Loader2,
} from "lucide-react";
import { getVeiculos, createVeiculo, deactivateVeiculo } from "@/lib/services/veiculos";

// ── Helpers ─────────────────────────────────────────────
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
    <div className="card">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-900 border border-brand-700 flex items-center justify-center text-brand-400">
            <Car size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-100">
              {v.marca} {v.modelo} <span className="text-ink-400">· {v.placa}</span>
            </p>
            <p className="text-xs text-ink-400">
              {v.ano} · {v.cor} · {v.quantidadeMaximaPassageiros} passageiros
              {v.terceirizado && <span className="ml-2 text-yellow-400">· Terceirizado</span>}
            </p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="border-t border-dark-50 px-4 pb-4 pt-3 space-y-4">
          {/* Identificação */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              ["Chassi",   v.chassi],
              ["Renavam",  v.renavam],
              ["Val. Veículo", v.valorVeiculo],
              ["Val. Seguro",  v.valorSeguro],
            ].map(([k,val]) => (
              <div key={k}>
                <span className="text-ink-400">{k}</span>
                <p className="text-ink-100 font-medium mt-0.5">{val || "—"}</p>
              </div>
            ))}
          </div>
          {/* Vistorias */}
          <div>
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">Vistorias</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                ["Vistoria Agerba",     v.valorVistoria],
                ["Licenciamento",       v.valorLicenciamento],
                ["GTX Vistoria",        v.gtxVistoria],
                ["Renovação Simpl.",    v.renovacaoSimplificada],
              ].map(([k,val]) => (
                <div key={k}>
                  <span className="text-ink-400">{k}</span>
                  <p className="text-ink-100 font-medium mt-0.5">{val || "—"}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Ficha Técnica */}
          <div>
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-2">Ficha Técnica</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                ["KM/mês",           v.mediaKmRodadoMes ? `${v.mediaKmRodadoMes} km` : "—"],
                ["KM/litro",         v.combustivelPorLitro ? `${v.combustivelPorLitro} km/l` : "—"],
                ["Revisão (20k km)", v.revisaoVeiculo],
                ["Pneus (60k km)",   v.pneusVeiculo],
                ["Manutenção",       v.manutencaoVeiculo],
                ["Alinhamento",      v.alinhamentoPneu],
                ["Balanceamento",    v.balanceamento],
                ["Lavagem",          v.lavagem],
              ].map(([k,val]) => (
                <div key={k}>
                  <span className="text-ink-400">{k}</span>
                  <p className="text-ink-100 font-medium mt-0.5">{val || "—"}</p>
                </div>
              ))}
            </div>
          </div>
          {v.terceirizado && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-3">
              <p className="text-xs text-yellow-400 font-semibold mb-1">Veículo Terceirizado</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-ink-400">CPF/CNPJ</span><p className="text-ink-100">{v.cpfCnpj}</p></div>
                <div><span className="text-ink-400">Proprietário</span><p className="text-ink-100">{v.proprietario}</p></div>
                <div><span className="text-ink-400">Telefone</span><p className="text-ink-100">{v.telefone}</p></div>
              </div>
            </div>
          )}
          <button onClick={() => onDelete(v.id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition">
            <Trash2 size={13} /> Remover veículo
          </button>
        </div>
      )}
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
      .catch(console.error)
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-100">Veículos</h1>
          <p className="text-ink-400 text-sm mt-1">{veiculos.length} veículo{veiculos.length !== 1 ? "s" : ""} cadastrado{veiculos.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setTab(tab === "cadastro" ? "lista" : "cadastro")}
          className={tab === "cadastro" ? "btn-outline" : "btn-primary"}>
          {tab === "cadastro" ? "← Voltar à lista" : <><Plus size={16} /> Cadastrar Veículo</>}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-brand-900/40 border border-brand-700 text-brand-400 rounded-xl px-4 py-3 text-sm mb-5">
          <CheckCircle size={16} /> Veículo cadastrado com sucesso!
        </div>
      )}

      {/* ── LISTA ──────────────────────────────────── */}
      {tab === "lista" && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field input-icon text-sm" placeholder="Buscar por placa, modelo ou marca..." />
            </div>
          </div>
          {loading ? (
            <div className="card p-14 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-14 text-center">
              <Car size={48} className="text-dark-50 mx-auto mb-3" />
              <p className="text-ink-400 text-sm">Nenhum veículo encontrado</p>
              <button onClick={() => setTab("cadastro")} className="btn-primary mt-4 mx-auto w-fit text-sm">
                <Plus size={15} /> Cadastrar primeiro veículo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(v => (
                <VehicleCard key={v.id} v={v}
                  onDelete={async (id) => {
                    try {
                      await deactivateVeiculo(id);
                      setVeiculos(p => p.filter(x => x.id !== id));
                    } catch (err) { alert(err.message); }
                  }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CADASTRO ───────────────────────────────── */}
      {tab === "cadastro" && (
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold text-ink-100 mb-6 flex items-center gap-2">
            <Car size={20} className="text-brand-400" /> Novo Veículo
          </h2>

          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Placa *">
              <Input value={form.placa} onChange={v => upd("placa", maskPlaca(v))} placeholder="AAA-0000" />
              {errors.placa && <p className="text-red-400 text-xs mt-1">{errors.placa}</p>}
            </Field>
            <Field label="Modelo *">
              <Input value={form.modelo} onChange={v => upd("modelo", v)} placeholder="Sprinter 415" />
              {errors.modelo && <p className="text-red-400 text-xs mt-1">{errors.modelo}</p>}
            </Field>
            <Field label="Marca *">
              <Select value={form.marca} onChange={v => upd("marca", v)} options={MARCAS} />
              {errors.marca && <p className="text-red-400 text-xs mt-1">{errors.marca}</p>}
            </Field>
            <Field label="Ano *">
              <Input value={form.ano} onChange={v => upd("ano", maskAno(v))} placeholder="2023" />
              {errors.ano && <p className="text-red-400 text-xs mt-1">{errors.ano}</p>}
            </Field>
            <Field label="Chassi">
              <Input value={form.chassi} onChange={v => upd("chassi", v.toUpperCase().slice(0,17))} placeholder="17 caracteres" />
            </Field>
            <Field label="Renavam">
              <Input value={form.renavam} onChange={v => upd("renavam", maskRenavam(v))} placeholder="00000000000" />
            </Field>
            <Field label="Cor">
              <Select value={form.cor} onChange={v => upd("cor", v)} options={CORES} />
            </Field>
            <Field label="Qtd. Máx. Passageiros *">
              <Input type="number" value={form.quantidadeMaximaPassageiros}
                onChange={v => upd("quantidadeMaximaPassageiros", v)} placeholder="15" />
              {errors.qtd && <p className="text-red-400 text-xs mt-1">{errors.qtd}</p>}
            </Field>
            <Field label="Valor do Veículo (R$)">
              <MoneyInput value={form.valorVeiculo} onChange={v => upd("valorVeiculo", v)} />
            </Field>
            <Field label="Valor do Seguro por Ano (R$)">
              <MoneyInput value={form.valorSeguro} onChange={v => upd("valorSeguro", v)} />
            </Field>
          </div>

          {/* Terceirizado */}
          <div className="mt-6">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div className={`w-11 h-6 rounded-full transition-colors relative ${form.terceirizado ? "bg-brand-500" : "bg-dark-50"}`}
                onClick={() => upd("terceirizado", !form.terceirizado)}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.terceirizado ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm font-medium text-ink-200">Veículo Terceirizado</span>
            </label>
          </div>

          {form.terceirizado && (
            <div className="mt-4 p-4 bg-yellow-900/10 border border-yellow-800/50 rounded-xl">
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-3">Dados do Proprietário</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="CPF / CNPJ">
                  <Input value={form.cpfCnpj} onChange={v => upd("cpfCnpj", v)} placeholder="000.000.000-00" />
                </Field>
                <Field label="Proprietário">
                  <Input value={form.proprietario} onChange={v => upd("proprietario", v)} placeholder="Nome do proprietário" />
                </Field>
                <Field label="Telefone">
                  <Input value={form.telefone} onChange={v => upd("telefone", maskPhone(v))} placeholder="(00) 0 0000-0000" />
                </Field>
              </div>
            </div>
          )}

          {/* Vistorias */}
          <Section title="Vistorias Agerba" icon={<Shield size={14} />} cols={2}>
            <Field label="Valor Vistoria Agerba (R$)">
              <MoneyInput value={form.valorVistoria} onChange={v => upd("valorVistoria", v)} />
            </Field>
            <Field label="Valor Licenciamento Agerba (R$)">
              <MoneyInput value={form.valorLicenciamento} onChange={v => upd("valorLicenciamento", v)} />
            </Field>
            <Field label="GTX Vistoria (R$)">
              <MoneyInput value={form.gtxVistoria} onChange={v => upd("gtxVistoria", v)} />
            </Field>
            <Field label="Renovação Simplificada Agerba (R$)">
              <MoneyInput value={form.renovacaoSimplificada} onChange={v => upd("renovacaoSimplificada", v)} />
            </Field>
          </Section>

          {/* Ficha Técnica */}
          <Section title="Ficha Técnica" icon={<BarChart2 size={14} />} cols={2}>
            <Field label="Média KM Rodado por Mês">
              <Input type="number" value={form.mediaKmRodadoMes}
                onChange={v => upd("mediaKmRodadoMes", v)} placeholder="5000" />
            </Field>
            <Field label="Combustível (KM por litro)">
              <Input type="number" value={form.combustivelPorLitro}
                onChange={v => upd("combustivelPorLitro", v)} placeholder="12" />
            </Field>
            <Field label="Revisão a cada 20.000 km (R$)">
              <MoneyInput value={form.revisaoVeiculo} onChange={v => upd("revisaoVeiculo", v)} />
            </Field>
            <Field label="Pneus a cada 60.000 km (R$)">
              <MoneyInput value={form.pneusVeiculo} onChange={v => upd("pneusVeiculo", v)} />
            </Field>
            <Field label="Manutenção a cada 20.000 km (R$)">
              <MoneyInput value={form.manutencaoVeiculo} onChange={v => upd("manutencaoVeiculo", v)} />
            </Field>
            <Field label="Valor Lavagem (R$)">
              <MoneyInput value={form.lavagem} onChange={v => upd("lavagem", v)} />
            </Field>
            <Field label="Alinhamento por troca de pneu (R$)">
              <MoneyInput value={form.alinhamentoPneu} onChange={v => upd("alinhamentoPneu", v)} />
            </Field>
            <Field label="Balanceamento (R$)">
              <MoneyInput value={form.balanceamento} onChange={v => upd("balanceamento", v)} />
            </Field>
          </Section>

          {/* Ações */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-dark-50">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8 disabled:opacity-50">
              {saving ? "Salvando..." : <><CheckCircle size={16} /> Cadastrar Veículo</>}
            </button>
            <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); }} className="btn-outline">
              Limpar campos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
