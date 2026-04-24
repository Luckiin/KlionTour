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

import { translateAuthError } from "@/lib/utils";

import SplitText from "@/components/motion/SplitText";

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
      setError(translateAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-surface-dark text-brand-900 dark:text-white">
      {/* =============== PAINEL VISUAL PREMIUM =============== */}
      <aside className="hidden lg:flex relative overflow-hidden bg-[#060c1a] p-12 flex-col justify-between text-white">
        {/* Background Image with Ken Burns */}
        <div className="absolute inset-0 z-0">
          <img
            src="/happy_travelers_van_1776989822644.png"
            alt="Klion Experience"
            className="w-full h-full object-cover animate-ken-burns opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#060c1a] via-[#060c1a]/40 to-transparent" />
          
          {/* Mesh Gradients */}
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-brand-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-blue-400/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-brand-500/20">
            <img src="/logo.png" alt="Klion Tour" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-serif text-lg tracking-tight">Klion Tour</div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/60 mt-0.5 font-bold">
              Premium Transport
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-lg">
          <Reveal direction="fade">
            <p className="eyebrow !text-brand-300 mb-6">
              <Sparkles size={14} className="animate-pulse" /> Junte-se a nós
            </p>
          </Reveal>
          
          <SplitText
            as="h2"
            className="font-serif text-5xl lg:text-7xl font-light leading-[1.02] tracking-tightest"
            text="Viaje melhor com a"
            stagger={0.05}
          />
          <SplitText
            as="h2"
            className="font-serif text-5xl lg:text-7xl italic text-brand-300 font-light leading-[1.02] tracking-tightest mt-2"
            text="sua própria conta."
            delay={0.5}
            stagger={0.05}
          />

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 1.2 } },
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
                className="flex items-center gap-3 text-white/80"
              >
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <CheckCircle size={14} className="text-brand-300" />
                </div>
                <span className="text-sm font-light tracking-wide">{b}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="relative z-10"
        >
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            © {new Date().getFullYear()} Klion Tour. Todos os direitos reservados.
          </div>
        </motion.div>
      </aside>

      {/* =============== FORM SECTION =============== */}
      <section className="relative flex flex-col p-6 lg:p-12 overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-steel-500 hover:text-brand-500 transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center py-12">
          <div className="w-full max-w-2xl">
            <Reveal direction="up" duration={0.8}>
              <span className="eyebrow">Cadastro</span>
              <h1 className="display-2 mt-4">
                Crie sua <em className="not-italic text-brand-500 dark:text-brand-300">conta.</em>
              </h1>
              <p className="lead mt-4 text-steel-500 dark:text-steel-400">
                Preencha os dados abaixo para começar sua experiência premium.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.2} duration={0.8}>
              <form onSubmit={handleSubmit} className="mt-12 space-y-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-300 bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4 shadow-sm"
                  >
                    <AlertCircle size={18} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldWrap label="Nome completo" full>
                    <User size={18} className="field-icon" />
                    <input type="text" value={form.nomeCompleto} onChange={(e) => update("nomeCompleto", e.target.value)} className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="Seu nome completo" />
                  </FieldWrap>

                  <FieldWrap label="E-mail">
                    <Mail size={18} className="field-icon" />
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="seu@email.com" />
                  </FieldWrap>

                  <FieldWrap label="WhatsApp">
                    <Phone size={18} className="field-icon" />
                    <input type="tel" value={form.celular} onChange={(e) => update("celular", maskPhone(e.target.value))} className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="(00) 00000-0000" />
                  </FieldWrap>

                  <FieldWrap label={`Documento ${form.isEmpresa ? "(CNPJ)" : "(CPF)"}`} full>
                    <FileText size={18} className="field-icon" />
                    <input type="text" value={form.documento} onChange={(e) => update("documento", form.isEmpresa ? maskCNPJ(e.target.value) : maskCPF(e.target.value))} className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder={form.isEmpresa ? "00.000.000/0000-00" : "000.000.000-00"} />
                  </FieldWrap>

                  <div className="md:col-span-2 relative space-y-2">
                    <label className="block text-sm font-semibold text-brand-900 dark:text-white/90 ml-1">Endereço principal</label>
                    <div className="relative group">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
                      <input
                        type="text"
                        value={form.endereco}
                        onChange={(e) => { update("endereco", e.target.value); setIsSearching(false); }}
                        onFocus={() => setIsSearching(false)}
                        className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all"
                        placeholder="Ex: Av. Paulista, 1000…"
                      />
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft-xl max-h-60 overflow-y-auto backdrop-blur-xl">
                        {suggestions.map((item, idx) => (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() => selectSuggestion(item)}
                              className="w-full text-left px-5 py-4 text-sm hover:bg-brand-500/10 dark:hover:bg-brand-300/10 border-b border-surface-border dark:border-surface-dark-border last:border-0 transition flex flex-col items-start gap-1"
                            >
                              <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
                                <span className="font-semibold text-brand-900 dark:text-white truncate">
                                  {item.display_name.split(',')[0]}
                                </span>
                              </div>
                              <span className="text-xs text-steel-500 ml-6">{item.display_name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <FieldWrap label="Cidade">
                    <Building2 size={18} className="field-icon" />
                    <input type="text" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="Sua cidade" />
                  </FieldWrap>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-brand-900 dark:text-white/90 ml-1">Estado / CEP</label>
                    <div className="flex gap-3">
                      <input type="text" value={form.estado} onChange={(e) => update("estado", e.target.value)} className="input-field w-1/3 text-center uppercase !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="UF" maxLength={2} />
                      <input type="text" value={form.cep} onChange={(e) => update("cep", maskCEP(e.target.value))} className="input-field w-2/3 !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="00000-000" />
                    </div>
                  </div>

                  <FieldWrap label="Senha" full>
                    <Lock size={18} className="field-icon" />
                    <input type={showPass ? "text" : "password"} value={form.senha} onChange={(e) => update("senha", e.target.value)} className="input-field input-icon pr-12 !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all" placeholder="Mínimo 6 caracteres" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-400 hover:text-brand-500 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </FieldWrap>

                  <label className="md:col-span-2 flex items-center gap-3 mt-2 text-sm text-brand-900 dark:text-white/80 cursor-pointer select-none group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={form.isEmpresa}
                        onChange={(e) => update("isEmpresa", e.target.checked)}
                        className="peer w-5 h-5 rounded-lg border-steel-300 text-brand-500 focus:ring-brand-500/20 transition-all cursor-pointer"
                      />
                    </div>
                    <span>Sou uma empresa (Pessoa Jurídica)</span>
                  </label>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary w-full py-4 text-base font-bold shadow-brand-500/20 active:scale-[0.98] transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Criando conta...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Finalizar cadastro <ArrowRight size={20} />
                      </div>
                    )}
                  </button>
                </div>

                <div className="pt-8 border-t border-surface-border dark:border-surface-dark-border text-center">
                  <p className="text-sm text-steel-500">
                    Já tem uma conta?{" "}
                    <Link href="/auth/entrar" className="text-brand-500 font-bold hover:text-brand-600 transition-colors">
                      Fazer login
                    </Link>
                  </p>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* helper local */}
      <style jsx global>{`
        .field-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
      `}</style>
    </div>
  );
}

function FieldWrap({ label, children, full = false }) {
  return (
    <div className={full ? "md:col-span-2 space-y-2" : "space-y-2"}>
      <label className="block text-sm font-semibold text-brand-900 dark:text-white/90 ml-1">{label}</label>
      <div className="relative group">{children}</div>
    </div>
  );
}
