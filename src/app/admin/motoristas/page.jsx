"use client";

import { useState, useEffect } from "react";
import {
  UserPlus, Users, Search,
  ChevronDown, CheckCircle, Trash2, Loader2,
} from "lucide-react";
import { getMotoristas, createMotorista, deactivateMotorista } from "@/lib/services/motoristas";

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
    <div className="card">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-900 border border-brand-700 flex items-center justify-center text-brand-400 font-bold">
            {m.nomeCompleto?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-100">{m.nomeCompleto}</p>
            <p className="text-xs text-ink-400">CNH {m.tipoCnh} · {m.numeroCnh} · {m.cidade}/{m.uf}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-400 font-medium hidden sm:block">
            Sal. {m.salarioAnual || "—"}
          </span>
          <ChevronDown size={16} className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </div>
      {open && (
        <div className="border-t border-dark-50 px-4 pb-4 pt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                <span className="text-ink-400 text-xs">{k}</span>
                <p className="text-ink-100 font-medium text-xs mt-0.5">{v || "—"}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => onDelete(m.id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition">
              <Trash2 size={13} /> Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────
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
      .catch(console.error)
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-100">Motoristas</h1>
          <p className="text-ink-400 text-sm mt-1">{motoristas.length} motorista{motoristas.length !== 1 ? "s" : ""} cadastrado{motoristas.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setTab(tab === "cadastro" ? "lista" : "cadastro")}
          className={tab === "cadastro" ? "btn-outline" : "btn-primary"}>
          {tab === "cadastro" ? "← Voltar à lista" : <><UserPlus size={16} /> Cadastrar Motorista</>}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-brand-900/40 border border-brand-700 text-brand-400 rounded-xl px-4 py-3 text-sm mb-5">
          <CheckCircle size={16} /> Motorista cadastrado com sucesso!
        </div>
      )}

      {/* ── LISTA ──────────────────────────────────── */}
      {tab === "lista" && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field input-icon text-sm" placeholder="Buscar por nome, CPF ou cidade..." />
            </div>
          </div>
          {loading ? (
            <div className="card p-14 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-14 text-center">
              <Users size={48} className="text-dark-50 mx-auto mb-3" />
              <p className="text-ink-400 text-sm">Nenhum motorista encontrado</p>
              <button onClick={() => setTab("cadastro")} className="btn-primary mt-4 mx-auto w-fit text-sm">
                <UserPlus size={15} /> Cadastrar primeiro motorista
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(m => (
                <DriverCard key={m.id} m={m}
                  onDelete={async (id) => {
                    try {
                      await deactivateMotorista(id);
                      setMotoristas(p => p.filter(x => x.id !== id));
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
            <UserPlus size={20} className="text-brand-400" /> Novo Motorista
          </h2>

          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome Completo *">
              <Input value={form.nomeCompleto} onChange={v => upd("nomeCompleto", v)} placeholder="Nome completo" />
              {errors.nomeCompleto && <p className="text-red-400 text-xs mt-1">{errors.nomeCompleto}</p>}
            </Field>
            <Field label="Data de Nascimento *">
              <Input type="date" value={form.dataNascimento} onChange={v => upd("dataNascimento", v)} />
              {errors.dataNascimento && <p className="text-red-400 text-xs mt-1">{errors.dataNascimento}</p>}
            </Field>
            <Field label="CPF *">
              <Input value={form.cpf} onChange={v => upd("cpf", maskCPF(v))} placeholder="000.000.000-00" />
              {errors.cpf && <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>}
            </Field>
            <Field label="RG">
              <Input value={form.rg} onChange={v => upd("rg", maskRG(v))} placeholder="00.000.000-0" />
            </Field>
            <Field label="Órgão Expedidor">
              <Input value={form.orgaoExpedidor} onChange={v => upd("orgaoExpedidor", v)} placeholder="SSP/BA" />
            </Field>
            <Field label="Data de Emissão (RG)">
              <Input type="date" value={form.dataEmissao} onChange={v => upd("dataEmissao", v)} />
            </Field>
          </div>

          <Section title="Endereço">
            <Field label="Endereço" col="md:col-span-2">
              <Input value={form.endereco} onChange={v => upd("endereco", v)} placeholder="Rua, número, bairro" />
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
            <Field label="Telefone / WhatsApp *">
              <Input value={form.telefone} onChange={v => upd("telefone", maskPhone(v))} placeholder="(00) 0 0000-0000" />
              {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone}</p>}
            </Field>
          </Section>

          <Section title="Remuneração">
            <Field label="Salário Anual (R$)" col="md:col-span-2">
              <Input value={form.salarioAnual} onChange={v => upd("salarioAnual", maskMoney(v))} placeholder="R$ 0,00" />
            </Field>
          </Section>

          <Section title="Carteira de Habilitação (CNH)">
            <Field label="Número da CNH *">
              <Input value={form.numeroCnh} onChange={v => upd("numeroCnh", maskCNH(v))} placeholder="00000000000" />
              {errors.numeroCnh && <p className="text-red-400 text-xs mt-1">{errors.numeroCnh}</p>}
            </Field>
            <Field label="Categoria *">
              <Select value={form.tipoCnh} onChange={v => upd("tipoCnh", v)} options={TIPOS_CNH} />
              {errors.tipoCnh && <p className="text-red-400 text-xs mt-1">{errors.tipoCnh}</p>}
            </Field>
            <Field label="Data de Emissão (CNH)">
              <Input type="date" value={form.dataEmissaoCnh} onChange={v => upd("dataEmissaoCnh", v)} />
            </Field>
            <Field label="Cidade (CNH)">
              <Input value={form.cidadeCnh} onChange={v => upd("cidadeCnh", v)} placeholder="Cidade de emissão" />
            </Field>
            <Field label="UF (CNH)">
              <Input value={form.ufCnh} onChange={v => upd("ufCnh", v.toUpperCase().slice(0,2))} placeholder="BA" />
            </Field>
          </Section>

          {/* Ações */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-dark-50">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8 disabled:opacity-50">
              {saving ? "Salvando..." : <><CheckCircle size={16} /> Cadastrar Motorista</>}
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
