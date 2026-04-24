"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Shield,
  Save, Loader2, CheckCircle2, AlertCircle,
  Lock, Fuel
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAppSettings, upsertAppSettings } from "@/lib/services/appSettings";
import { maskMoeda, parseMoeda, fmtBRL } from "@/lib/utils";

function formatSettingsMoney(value) {
  if (value === null || value === undefined || value === "") return "";
  return maskMoeda(String(Math.round(Number(value) * 100)));
}

export default function AdminConfiguracoesPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gasPricePerKm: "",
  });

  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [passForm, setPassForm] = useState({ new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  const updateField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    let active = true;

    getAppSettings()
      .then((settings) => {
        if (!active) return;
        setForm((prev) => ({
          ...prev,
          gasPricePerKm: formatSettingsMoney(settings.gas_price_per_km),
        }));
      })
      .catch((err) => {
        if (!active) return;
        setMsg({ type: "error", text: "Erro ao carregar configurações: " + err.message });
      })
      .finally(() => {
        if (active) setLoadingSettings(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const maskPhone = (v) => {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})(\d+?)$/, "$1");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const gasPricePerKm = parseMoeda(form.gasPricePerKm);
      if (gasPricePerKm <= 0) {
        throw new Error("Informe um valor de gasolina válido.");
      }

      await Promise.all([
        updateProfile({
          name: form.name,
          email: form.email,
          phone: form.phone,
        }),
        upsertAppSettings({
          gas_price_per_km: gasPricePerKm,
        }),
      ]);

      setMsg({ type: "success", text: `Configurações salvas! Gasolina atual: ${fmtBRL(gasPricePerKm)} por km.` });
      setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    } catch (err) {
      setMsg({ type: "error", text: "Erro ao atualizar: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ type: "error", text: "As senhas não coincidem!" });
      return;
    }
    if (passForm.new.length < 6) {
      setPassMsg({ type: "error", text: "Mínimo de 6 caracteres." });
      return;
    }

    setPassLoading(true);
    setPassMsg({ type: "", text: "" });

    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: passForm.new });
      if (error) throw error;

      setPassMsg({ type: "success", text: "Senha alterada com sucesso!" });
      setPassForm({ new: "", confirm: "" });
    } catch (err) {
      setPassMsg({ type: "error", text: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-xl">
          <User size={28} />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-brand-900 dark:text-white leading-tight">Configurações de Conta</h2>
          <p className="text-steel-500 text-sm mt-1 uppercase tracking-widest font-bold">Gerencie perfil e parâmetros operacionais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border-r border-surface-border dark:border-surface-dark-border pr-8 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "profile"
                ? "bg-brand-500 text-white shadow-lg"
                : "text-steel-500 hover:bg-brand-500/5 hover:text-brand-900 dark:hover:text-white"
              }`}
          >
            <User size={16} /> Meus Dados
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "security"
                ? "bg-brand-500 text-white shadow-lg"
                : "text-steel-500 hover:bg-brand-500/5 hover:text-brand-900 dark:hover:text-white"
              }`}
          >
            <Shield size={16} /> Segurança
          </button>
          <button
            onClick={() => setActiveTab("parameters")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === "parameters"
                ? "bg-brand-500 text-white shadow-lg"
                : "text-steel-500 hover:bg-brand-500/5 hover:text-brand-900 dark:hover:text-white"
              }`}
          >
            <Fuel size={16} /> Parâmetros
          </button>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <form onSubmit={handleProfileSubmit} className="card bg-white dark:bg-surface-dark-elevated p-8 md:p-10 border border-surface-border dark:border-surface-dark-border shadow-soft flex flex-col h-full">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-brand-500 rounded-full" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Informações Pessoais</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Nome Completo</Label>
                          <InputMask icon={User}>
                            <input
                              type="text"
                              value={form.name}
                              onChange={e => updateField("name", e.target.value)}
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner"
                              required
                            />
                          </InputMask>
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail de Trabalho</Label>
                          <InputMask icon={Mail}>
                            <input
                              type="email"
                              value={form.email}
                              onChange={e => updateField("email", e.target.value)}
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner"
                              required
                            />
                          </InputMask>
                        </div>
                        <div className="space-y-2">
                          <Label>WhatsApp</Label>
                          <InputMask icon={Phone}>
                            <input
                              type="text"
                              value={maskPhone(form.phone)}
                              onChange={e => updateField("phone", e.target.value)}
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner"
                              placeholder="(00) 00000-0000"
                            />
                          </InputMask>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between gap-6">
                    <div className="flex-1">
                      {msg.text && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center gap-2 p-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${msg.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}
                        >
                          {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {msg.text}
                        </motion.div>
                      )}
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar Perfil
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "parameters" && (
              <motion.div
                key="parameters"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <form onSubmit={handleProfileSubmit} className="card bg-white dark:bg-surface-dark-elevated p-8 md:p-10 border border-surface-border dark:border-surface-dark-border shadow-soft flex flex-col h-full">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-brand-500 rounded-full" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Parâmetros da Cotação</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Valor Atual da Gasolina</Label>
                          <InputMask icon={Fuel}>
                            <input
                              type="text"
                              value={form.gasPricePerKm}
                              onChange={e => updateField("gasPricePerKm", maskMoeda(e.target.value))}
                              className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner"
                              placeholder="0,00"
                              required
                            />
                          </InputMask>
                          <p className="text-[11px] text-steel-500 px-1 mt-1">
                            Esse valor é usado em `Ida e volta`, `Transfer In` e `Transfer Out`.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-brand-500/10 bg-brand-500/5 p-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Resumo Atual</p>
                          <p className="mt-3 text-2xl font-serif text-brand-900 dark:text-white">
                            {loadingSettings ? "Carregando..." : fmtBRL(parseMoeda(form.gasPricePerKm))}
                          </p>
                          <p className="mt-2 text-sm text-steel-500">
                            Atualize aqui sempre que houver alteração no valor praticado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between gap-6">
                    <div className="flex-1">
                      {msg.text && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center gap-2 p-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${msg.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}
                        >
                          {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {msg.text}
                        </motion.div>
                      )}
                    </div>
                    <button type="submit" disabled={saving || loadingSettings} className="btn-primary px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar Parâmetros
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <form onSubmit={handlePasswordSubmit} className="card bg-white dark:bg-surface-dark-elevated p-8 md:p-10 border border-surface-border dark:border-surface-dark-border shadow-soft flex flex-col h-full">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-brand-500 rounded-full" />
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 dark:text-white">Alterar Senha</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-6 max-w-md">
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <InputMask icon={Lock}>
                          <input
                            type="password"
                            value={passForm.new}
                            onChange={e => setPassForm(p => ({ ...p, new: e.target.value }))}
                            placeholder="••••••••"
                            className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner"
                            required
                          />
                        </InputMask>
                        <p className="text-[10px] text-steel-500 px-1 font-medium italic">A nova senha deve ter no mínimo 6 caracteres.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <InputMask icon={Lock}>
                          <input
                            type="password"
                            value={passForm.confirm}
                            onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
                            placeholder="••••••••"
                            className="input-field pl-12 bg-white dark:bg-surface-dark-elevated shadow-inner"
                            required
                          />
                        </InputMask>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between gap-6">
                    <div className="flex-1">
                      {passMsg.text && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center gap-2 p-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest ${passMsg.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}
                        >
                          {passMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {passMsg.text}
                        </motion.div>
                      )}
                    </div>
                    <button type="submit" disabled={passLoading} className="btn-primary px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                      {passLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      Redefinir Senha
                    </button>
                  </div>
                </form>
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
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-steel-400 px-1">
      {children}
    </label>
  );
}

function InputMask({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
      {children}
    </div>
  );
}
