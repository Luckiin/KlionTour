"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, Shield, 
  Save, Loader2, CheckCircle2, AlertCircle,
  Lock, Sparkles, Home, CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Reveal from "@/components/motion/Reveal";

export default function ConfiguracoesPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' ou 'security'
  
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cep: user?.cep || "",
    endereco: user?.endereco || "",
    cidade: user?.cidade || "",
    estado: user?.estado || "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [passForm, setPassForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  const updateField = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ type: "error", text: "As senhas não coincidem!" });
      return;
    }
    if (passForm.new.length < 6) {
      setPassMsg({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setPassLoading(true);
    setPassMsg({ type: "", text: "" });

    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ 
        password: passForm.new 
      });

      if (error) throw error;

      setPassMsg({ type: "success", text: "Senha atualizada com sucesso!" });
      setPassForm({ current: "", new: "", confirm: "" });
    } catch (err) {
      setPassMsg({ type: "error", text: "Erro ao atualizar senha: " + err.message });
    } finally {
      setPassLoading(false);
    }
  };

  const maskPhone = (v) => {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})(\d+?)$/, "$1");
  };

  const maskCEP = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);

  const fetchAddress = async (cep) => {
    const raw = cep.replace(/\D/g, "");
    if (raw.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(p => ({
            ...p,
            endereco: `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}`,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (err) { }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      await updateProfile(form);
      setMsg({ type: "success", text: "Perfil atualizado com sucesso!" });
      setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    } catch (err) {
      setMsg({ type: "error", text: "Erro ao atualizar: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Lado Esquerdo: Sidebar de Navegação Local */}
        <div className="lg:col-span-1 space-y-6">
           <div className="card glass p-6 border-brand-500/10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-lg">
                    <User size={24} />
                 </div>
                 <div>
                    <h3 className="font-serif text-xl border-none">{user?.name?.split(' ')[0]}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-steel-500 font-bold">Cliente KlionTour</p>
                 </div>
              </div>

              <div className="space-y-1">
                 <button 
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    activeTab === "profile" 
                      ? "bg-brand-500/10 text-brand-600 shadow-sm" 
                      : "text-steel-500 hover:bg-surface-subtle"
                  }`}
                 >
                    <User size={16} /> Meu Perfil
                 </button>
                 <button 
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    activeTab === "security" 
                      ? "bg-brand-500/10 text-brand-600 shadow-sm" 
                      : "text-steel-500 hover:bg-surface-subtle"
                  }`}
                 >
                    <Shield size={16} /> Segurança
                 </button>
              </div>
           </div>
        </div>

        {/* Lado Direito: Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="card glass p-8 md:p-10 space-y-10">
                    
                    {/* SEÇÃO 1: IDENTIDADE */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Informações de Identidade</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2 space-y-2">
                          <Label>Nome Completo</Label>
                          <InputIcon icon={User}>
                            <input 
                              type="text" 
                              value={form.name} 
                              onChange={e => updateField("name", e.target.value)} 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                              required 
                            />
                          </InputIcon>
                        </div>

                        <div className="space-y-2">
                          <Label>E-mail de Contato</Label>
                          <InputIcon icon={Mail}>
                            <input 
                              type="email" 
                              value={form.email} 
                              onChange={e => updateField("email", e.target.value)} 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                              required 
                            />
                          </InputIcon>
                        </div>

                        <div className="space-y-2">
                          <Label>WhatsApp / Celular</Label>
                          <InputIcon icon={Phone}>
                            <input 
                              type="text" 
                              value={maskPhone(form.phone)} 
                              onChange={e => updateField("phone", e.target.value)} 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                              placeholder="(00) 00000-0000"
                            />
                          </InputIcon>
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO 2: LOCALIZAÇÃO */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Endereço</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-1 space-y-2">
                          <Label>CEP</Label>
                          <input 
                            type="text" 
                            value={maskCEP(form.cep)} 
                            onChange={e => {
                              const v = e.target.value;
                              updateField("cep", v);
                              fetchAddress(v);
                            }} 
                            className="input-field bg-white dark:bg-surface-dark-elevated shadow-inner" 
                            placeholder="00000-000"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <Label>Endereço Completo</Label>
                          <InputIcon icon={Home}>
                            <input 
                              type="text" 
                              value={form.endereco} 
                              onChange={e => updateField("endereco", e.target.value)} 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                              placeholder="Rua, Número, Bairro"
                            />
                          </InputIcon>
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <Label>Cidade</Label>
                          <InputIcon icon={MapPin}>
                            <input 
                              type="text" 
                              value={form.cidade} 
                              onChange={e => updateField("cidade", e.target.value)} 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                            />
                          </InputIcon>
                        </div>

                        <div className="sm:col-span-1 space-y-2">
                          <Label>Estado (UF)</Label>
                          <input 
                            type="text" 
                            maxLength={2}
                            value={form.estado} 
                            onChange={e => updateField("estado", e.target.value.toUpperCase())} 
                            className="input-field bg-white dark:bg-surface-dark-elevated shadow-inner uppercase text-center font-bold" 
                            placeholder="EX"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RODAPÉ DO CARD */}
                    <div className="pt-8 border-t border-surface-border dark:border-surface-dark-border flex flex-col sm:flex-row items-center justify-between gap-6">
                       <div className="flex-1">
                          {msg.text && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-center gap-2 p-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                msg.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                              }`}
                            >
                              {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                              {msg.text}
                            </motion.div>
                          )}
                       </div>
                       <button 
                         type="submit" 
                         disabled={saving}
                         className="btn-primary w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
                       >
                         {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:rotate-12 transition-transform" />}
                         Salvar Perfil
                       </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handlePasswordChange}>
                  <div className="card glass p-8 md:p-10 space-y-10">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Trocar Senha</h4>
                     </div>

                     <div className="grid grid-cols-1 gap-6 max-w-md">
                        <div className="space-y-2 opacity-50 pointer-events-none">
                          <Label>Senha Atual</Label>
                          <InputIcon icon={Lock}>
                            <input type="password" placeholder="••••••••" className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" />
                          </InputIcon>
                        </div>
                        <div className="space-y-2">
                          <Label>Nova Senha</Label>
                          <InputIcon icon={Lock}>
                            <input 
                              type="password" 
                              value={passForm.new}
                              onChange={e => setPassForm(p => ({ ...p, new: e.target.value }))}
                              placeholder="••••••••" 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                              required
                            />
                          </InputIcon>
                          <p className="text-[10px] text-steel-500 px-1">Mínimo de 6 caracteres.</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Confirmar Nova Senha</Label>
                          <InputIcon icon={Lock}>
                            <input 
                              type="password" 
                              value={passForm.confirm}
                              onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
                              placeholder="••••••••" 
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner" 
                              required
                            />
                          </InputIcon>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-surface-border dark:border-surface-dark-border flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                          {passMsg.text && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-center gap-2 p-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                passMsg.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                              }`}
                            >
                              {passMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                              {passMsg.text}
                            </motion.div>
                          )}
                        </div>
                        <button 
                          type="submit" 
                          disabled={passLoading}
                          className="btn-primary w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
                        >
                          {passLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="group-hover:rotate-12 transition-transform" />}
                          Atualizar Senha
                        </button>
                     </div>
                  </div>
                </form>

                <div className="card p-8 border-dashed bg-transparent border-red-500/20 text-center space-y-4">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Zona de Risco</h4>
                  <p className="text-xs text-steel-500 max-w-sm mx-auto">Ao excluir sua conta, todos os seus dados e histórico de cotações serão removidos permanentemente.</p>
                  <button className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-8 py-3 rounded-xl border border-red-500/20 hover:bg-red-50 transition-all">
                    Solicitar Exclusão de Conta
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 px-1">
      {children}
    </label>
  );
}

function InputIcon({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
      {children}
    </div>
  );
}
