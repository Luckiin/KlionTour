"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Users, Search,
  ChevronDown, CheckCircle, Trash2, Loader2,
} from "lucide-react";
import { getMotoristas, createMotorista, deactivateMotorista } from "@/lib/services/motoristas";
import Reveal from "@/components/motion/Reveal";
const MONEY = (v) => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

// ── Helpers ─────────────────────────────────────────────
const maskCPF    = (v = "") => v.replace(/\D/g,"").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4").slice(0,14);
const maskRG     = (v = "") => v.replace(/\D/g,"").replace(/(\d{2})(\d{3})(\d{3})(\d{1})/,"$1.$2.$3-$4").slice(0,12);
const maskCEP    = (v = "") => v.replace(/\D/g,"").replace(/(\d{5})(\d{3})/,"$1-$2").slice(0,9);
const maskPhone  = (v = "") => v.replace(/\D/g,"").replace(/(\d{2})(\d{1})(\d{4})(\d{4})/,"($1) $2 $3-$4").slice(0,16);
const maskCNH    = (v = "") => v.replace(/\D/g,"").slice(0,11);
const maskMoney  = (v = "") => {
  const nums = v.replace(/\D/g,"");
  if (!nums) return "";
  const val = (parseInt(nums,10)/100).toFixed(2);
  return "R$ " + val.replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".");
};
const parseMoney = (v = "") => parseFloat(v.replace(/[R$\s.]/g,"").replace(",",".")) || 0;

const TIPOS_CNH = ["A","B","C","D","E","AB","AC","AD","AE"];

const EMPTY_FORM = {
  nomeCompleto:"", dataNascimento:"", cpf:"", rg:"", orgaoExpedidor:"",
  dataEmissao:"", endereco:"", cep:"", uf:"", cidade:"", telefone:"",
  salarioAnual:"", numeroCnh:"", tipoCnh:"", dataEmissaoCnh:"", cidadeCnh:"", ufCnh:"",
};

// ── Campo genérico ───────────────────────────────────────
function Field({ label, children, col = "md:col-span-1" }) {
  return (
    <div className={col}>
      <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field text-sm"
    />
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

// ── Seção com título ─────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-dark-50" />
        <span className="text-sm font-bold text-brand-400 uppercase tracking-widest">{title}</span>
        <div className="flex-1 h-px bg-dark-50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

// ── Card de motorista na listagem ────────────────────────
function DriverCard({ m, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`card overflow-hidden transition-all duration-300 ${open ? "ring-2 ring-brand-500/20 shadow-soft-lg" : ""}`}>
      <div 
        className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${open ? "bg-brand-500/5 text-brand-900 dark:text-white" : "hover:bg-brand-500/5 dark:hover:bg-brand-300/5 text-brand-900 dark:text-white"}`} 
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 flex items-center justify-center font-serif text-xl shrink-0">
            {m.nomeCompleto?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-brand-900 dark:text-white truncate">{m.nomeCompleto}</p>
            <p className="text-[10px] uppercase font-medium tracking-widest text-steel-400 mt-1 flex items-center gap-2">
              CNH {m.tipoCnh} · {m.numeroCnh} · {m.cidade}/{m.uf}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400">Salário</span>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-300">{m.salarioAnual || "—"}</span>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${open ? "bg-brand-500 text-white rotate-180" : "bg-steel-100 dark:bg-steel-800 text-steel-400"}`}>
            <ChevronDown size={14} />
          </div>
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
            <div className="p-6 space-y-6 bg-white/50 dark:bg-surface-dark-elevated/50 backdrop-blur-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  ["CPF",       m.cpf],
                  ["RG",        `${m.rg} ${m.orgaoExpedidor}`],
                  ["Telefone",  m.telefone],
                  ["Nascimento",m.dataNascimento],
                  ["Endereço",  m.endereco],
                  ["CEP",       m.cep],
                  ["Emissão RG",m.dataEmissao],
                  ["Emissão CNH",m.dataEmissaoCnh],
                  ["Cidade CNH",`${m.cidadeCnh}/${m.ufCnh}`],
                ].map(([k,v]) => (
                  <div key={k}>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-steel-400 block mb-1">{k}</span>
                    <p className="text-xs font-bold text-brand-900 dark:text-white truncate">{v || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end pt-4 border-t border-surface-border dark:border-surface-dark-border">
                <button onClick={() => onDelete(m.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={13} /> Desativar Motorista
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MotoristasPage() {
  const [tab,        setTab]        = useState("lista");
  const [motoristas, setMotoristas] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    getMotoristas({ apenasAtivos: false })
      .then(setMotoristas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = motoristas.filter(m =>
    !search || m.nomeCompleto?.toLowerCase().includes(search.toLowerCase()) ||
    m.cpf?.includes(search) || m.cidade?.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.nomeCompleto) e.nomeCompleto = "Obrigatório";
    if (!form.cpf || form.cpf.replace(/\D/g,"").length < 11) e.cpf = "CPF inválido";
    if (!form.dataNascimento) e.dataNascimento = "Obrigatório";
    if (!form.telefone) e.telefone = "Obrigatório";
    if (!form.numeroCnh) e.numeroCnh = "Obrigatório";
    if (!form.tipoCnh) e.tipoCnh = "Obrigatório";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const novo = await createMotorista({
        nome_completo:    form.nomeCompleto,
        data_nascimento:  form.dataNascimento || null,
        cpf:              form.cpf.replace(/\D/g,""),
        rg:               form.rg.replace(/\D/g,""),
        orgao_expedidor:  form.orgaoExpedidor || null,
        data_emissao_rg:  form.dataEmissao || null,
        endereco:         form.endereco || null,
        cep:              form.cep.replace(/\D/g,"") || null,
        cidade:           form.cidade || null,
        uf:               form.uf || null,
        telefone:         form.telefone.replace(/\D/g,""),
        salario_anual:    parseMoney(form.salarioAnual) || null,
        numero_cnh:       form.numeroCnh,
        tipo_cnh:         form.tipoCnh,
        data_emissao_cnh: form.dataEmissaoCnh || null,
        cidade_cnh:       form.cidadeCnh || null,
        uf_cnh:           form.ufCnh || null,
        ativo:            true,
      });
      setMotoristas(p => [novo, ...p]);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Reveal direction="down">
            <h1 className="text-3xl font-serif font-medium text-brand-900 dark:text-white">Motoristas</h1>
            <p className="text-steel-500 dark:text-steel-400 text-sm mt-1">{motoristas.length} condutores ativos na KlionTour</p>
          </Reveal>
        </div>
        <button onClick={() => setTab(tab === "cadastro" ? "lista" : "cadastro")}
          className={tab === "cadastro" ? "btn-outline py-3 px-6" : "btn-primary py-3 px-6"}>
          {tab === "cadastro" ? "← Voltar à lista" : <><UserPlus size={18} /> Cadastrar Motorista</>}
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest">
          <CheckCircle size={18} /> Motorista cadastrado com sucesso!
        </motion.div>
      )}

      {/* ── LISTA ──────────────────────────────────── */}
      {tab === "lista" && (
        <div className="space-y-6">
          <div className="card p-6 focus-within:ring-4 focus-within:ring-brand-500/5 transition-all">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field input-icon" placeholder="Buscar por nome, CPF ou cidade do condutor..." />
            </div>
          </div>

          {loading ? (
             <div className="card p-24 flex flex-col items-center justify-center border-dashed">
              <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
              <p className="text-sm font-bold text-steel-500 uppercase tracking-widest">Carregando Equipe...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-24 text-center border-dashed opacity-60">
              <Users size={48} className="text-steel-300 dark:text-steel-600 mx-auto mb-4" />
              <h4 className="font-serif text-2xl text-brand-900 dark:text-white mb-2">Nenhum Motorista</h4>
              <p className="text-steel-500 mb-6">Comece cadastrando um novo condutor.</p>
              <button onClick={() => setTab("cadastro")} className="btn-primary py-3 px-8 text-xs font-bold uppercase tracking-widest mx-auto">
                <UserPlus size={16} /> Cadastrar Motorista
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((m, i) => (
                <Reveal key={m.id} direction="up" delay={i * 0.03}>
                  <DriverCard m={m}
                    onDelete={async (id) => {
                      if(!confirm("Deseja realmente desativar este motorista?")) return;
                      try {
                        await deactivateMotorista(id);
                        setMotoristas(p => p.filter(x => x.id !== id));
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
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-brand-900 dark:text-white">Novo Condutor</h2>
              <p className="text-xs text-steel-500 dark:text-steel-400 mt-0.5">Cadastre os dados pessoais e profissionais do motorista</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Nome Completo *">
                <Input value={form.nomeCompleto} onChange={v => upd("nomeCompleto", v)} placeholder="Ex: João da Silva" />
                {errors.nomeCompleto && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.nomeCompleto}</p>}
              </Field>
              <Field label="Data de Nascimento *">
                <Input type="date" value={form.dataNascimento} onChange={v => upd("dataNascimento", v)} />
                {errors.dataNascimento && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.dataNascimento}</p>}
              </Field>
              <Field label="CPF *">
                <Input value={form.cpf} onChange={v => upd("cpf", maskCPF(v))} placeholder="000.000.000-00" />
                {errors.cpf && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.cpf}</p>}
              </Field>
              <Field label="RG">
                <Input value={form.rg} onChange={v => upd("rg", maskRG(v))} placeholder="Número do RG" />
              </Field>
              <Field label="Órgão Expedidor">
                <Input value={form.orgaoExpedidor} onChange={v => upd("orgaoExpedidor", v)} placeholder="SSP/BA" />
              </Field>
              <Field label="Data de Emissão (RG)">
                <Input type="date" value={form.dataEmissao} onChange={v => upd("dataEmissao", v)} />
              </Field>
            </div>

            <Section title="Localização e Contato">
              <Field label="Endereço Residencial" col="md:col-span-2">
                <Input value={form.endereco} onChange={v => upd("endereco", v)} placeholder="Rua, número, bairro e complemento" />
              </Field>
              <Field label="CEP">
                <Input value={form.cep} onChange={v => upd("cep", maskCEP(v))} placeholder="00000-000" />
              </Field>
              <Field label="Cidade">
                <Input value={form.cidade} onChange={v => upd("cidade", v)} placeholder="Cidade" />
              </Field>
              <Field label="UF">
                <Input value={form.uf} onChange={v => upd("uf", v.toUpperCase().slice(0,2))} placeholder="BA" />
              </Field>
              <Field label="WhatsApp / Telefone *">
                <Input value={form.telefone} onChange={v => upd("telefone", maskPhone(v))} placeholder="(00) 0 0000-0000" />
                {errors.telefone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.telefone}</p>}
              </Field>
            </Section>

            <Section title="Habilitação e Finanças">
              <Field label="Número da CNH *">
                <Input value={form.numeroCnh} onChange={v => upd("numeroCnh", maskCNH(v))} placeholder="Registro CNH" />
                {errors.numeroCnh && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.numeroCnh}</p>}
              </Field>
              <Field label="Categoria *">
                <Select value={form.tipoCnh} onChange={v => upd("tipoCnh", v)} options={TIPOS_CNH} />
                {errors.tipoCnh && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.tipoCnh}</p>}
              </Field>
              <Field label="Salário Anual (Base)">
                <Input value={form.salarioAnual} onChange={v => upd("salarioAnual", maskMoney(v))} placeholder="R$ 0,00" />
              </Field>
              <Field label="Emissão CNH">
                <Input type="date" value={form.dataEmissaoCnh} onChange={v => upd("dataEmissaoCnh", v)} />
              </Field>
            </Section>

            {/* Ações */}
            <div className="flex gap-4 mt-12 pt-8 border-t border-surface-border dark:border-surface-dark-border">
              <button onClick={handleSave} disabled={saving} className="btn-primary py-4 px-10 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                {saving ? "Processando..." : <><CheckCircle size={18} /> Salvar Motorista</>}
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
