"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, User,
  Phone, ArrowLeft, ArrowRight, CheckCircle, FileText, MapPin,
  Building2, Loader2, Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ThemeToggle";
import Reveal from "@/components/motion/Reveal";

const BENEFITS = [
  "Cotações oficiais com preço garantido",
  "Acompanhamento do status das viagens",
  "Histórico completo de pedidos",
  "Suporte prioritário",
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    nomeCompleto: "", email: "", senha: "", documento: "",
    isEmpresa: false, endereco: "", cidade: "", cep: "", estado: "",
    celular: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const [suggestions, setSuggestions]       = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching]         = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const maskCEP   = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
  const maskPhone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const maskCPF   = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14);
  const maskCNPJ  = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 18);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.endereco.length > 5 && !isSearching) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.endereco)}&addressdetails=1&limit=5&countrycodes=br`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (err) {
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.endereco, isSearching]);

  const selectSuggestion = (item) => {
    setIsSearching(true);
    const addr = item.address || {};
    setForm(prev => ({
      ...prev,
      endereco: item.display_name.split(',')[0] + (addr.house_number ? `, ${addr.house_number}` : ''),
      cidade:   addr.city || addr.town || addr.village || prev.cidade,
      cep:      addr.postcode ? maskCEP(addr.postcode) : prev.cep,
      estado:   addr.state || prev.estado,
    }));
    setShowSuggestions(false);
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.refresh();
      router.push("/painel");
    } catch (err) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface dark:bg-surface-dark text-brand-900 dark:text-white">
      {/* Painel visual */}
      <aside className="hidden lg:flex relative overflow-hidden bg-brand-gradient bg-[size:200%_200%] animate-gradient-pan p-12 flex-col justify-between text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-brand-300/20 blur-3xl animate-blob" />
          <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] opacity-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center">
            <span className="font-serif text-white text-lg leading-none">K</span>
          </div>
          <div>
            <div className="font-serif text-lg">{APP_NAME}</div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/70 mt-0.5">
              Fretamento executivo
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-lg">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="eyebrow !text-brand-200"
          >
            <Sparkles size={14} /> Junte-se à Klion
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="font-serif text-5xl lg:text-6xl font-light leading-[1.05] mt-4"
          >
            Viaje melhor
            <span className="block italic text-brand-200 mt-2">com sua conta.</span>
          </motion.h2>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
            }}
            className="mt-10 space-y-4"
          >
            {BENEFITS.map((b, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden:  { opacity: 0, x: -16 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-center gap-3 text-white/90"
              >
                <CheckCircle size={18} className="text-brand-200 shrink-0" />
                <span>{b}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 text-xs text-white/60"
        >
          © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </motion.div>
      </aside>

      {/* Form */}
      <section className="relative flex flex-col p-6 lg:p-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-steel-500 hover:text-brand-500 transition"
          >
            <ArrowLeft size={15} /> Voltar ao início
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center py-8">
          <div className="w-full max-w-xl">
            <Reveal direction="up">
              <span className="eyebrow">Cadastro</span>
              <h1 className="display-2 mt-3">
                Crie sua <em className="not-italic text-brand-500 dark:text-brand-300">conta.</em>
              </h1>
              <p className="lead mt-3">Preencha os dados abaixo para começar.</p>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <form onSubmit={handleSubmit} className="mt-10 space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3"
                  >
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldWrap label="Nome completo" full>
                    <User size={16} className="field-icon" />
                    <input type="text" value={form.nomeCompleto} onChange={(e) => update("nomeCompleto", e.target.value)} className="input-field input-icon" placeholder="Seu nome" />
                  </FieldWrap>

                  <FieldWrap label="E-mail">
                    <Mail size={16} className="field-icon" />
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field input-icon" placeholder="seu@email.com" />
                  </FieldWrap>

                  <FieldWrap label="WhatsApp">
                    <Phone size={16} className="field-icon" />
                    <input type="tel" value={form.celular} onChange={(e) => update("celular", maskPhone(e.target.value))} className="input-field input-icon" placeholder="(00) 00000-0000" />
                  </FieldWrap>

                  <FieldWrap label={`Documento ${form.isEmpresa ? "(CNPJ)" : "(CPF)"}`} full>
                    <FileText size={16} className="field-icon" />
                    <input type="text" value={form.documento} onChange={(e) => update("documento", form.isEmpresa ? maskCNPJ(e.target.value) : maskCPF(e.target.value))} className="input-field input-icon" placeholder={form.isEmpresa ? "00.000.000/0000-00" : "000.000.000-00"} />
                  </FieldWrap>

                  {/* Endereço inteligente */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1.5">Endereço principal</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-500" />
                      <input
                        type="text"
                        value={form.endereco}
                        onChange={(e) => { update("endereco", e.target.value); setIsSearching(false); }}
                        onFocus={() => setIsSearching(false)}
                        className="input-field input-icon"
                        placeholder="Ex: Av. Paulista, 1000…"
                      />
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft-lg max-h-60 overflow-y-auto">
                        {suggestions.map((item, idx) => (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() => selectSuggestion(item)}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-brand-500/10 dark:hover:bg-brand-300/10 border-b border-surface-border dark:border-surface-dark-border last:border-0 transition flex flex-col items-start gap-1"
                            >
                              <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-brand-500 mt-0.5 shrink-0" />
                                <span className="font-semibold text-brand-900 dark:text-white truncate">
                                  {item.display_name.split(',')[0]}
                                </span>
                              </div>
                              <span className="text-xs text-steel-500 ml-5">{item.display_name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <FieldWrap label="Cidade">
                    <Building2 size={16} className="field-icon" />
                    <input type="text" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} className="input-field input-icon" placeholder="Cidade" />
                  </FieldWrap>

                  <div>
                    <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1.5">Estado / CEP</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.estado} onChange={(e) => update("estado", e.target.value)} className="input-field w-1/3 text-center uppercase" placeholder="UF" maxLength={2} />
                      <input type="text" value={form.cep} onChange={(e) => update("cep", maskCEP(e.target.value))} className="input-field w-2/3" placeholder="00000-000" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1.5">Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-500" />
                      <input type={showPass ? "text" : "password"} value={form.senha} onChange={(e) => update("senha", e.target.value)} className="input-field input-icon pr-12" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-500 hover:text-brand-500 transition">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label className="md:col-span-2 flex items-center gap-2 mt-1 text-sm text-brand-900 dark:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isEmpresa}
                      onChange={(e) => update("isEmpresa", e.target.checked)}
                      className="w-4 h-4 rounded border-steel-300 text-brand-500 focus:ring-brand-500/40"
                    />
                    Sou uma empresa (Pessoa Jurídica)
                  </label>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>Criar minha conta <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-steel-500 mt-4">
                  Já tem uma conta?{" "}
                  <Link href="/auth/entrar" className="text-brand-500 font-medium hover:underline">
                    Faça login
                  </Link>
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* helper local */}
      <style jsx global>{`
        .field-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
      `}</style>
    </div>
  );
}

function FieldWrap({ label, children, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1.5">{label}</label>
      <div className="relative">{children}</div>
    </div>
  );
}
