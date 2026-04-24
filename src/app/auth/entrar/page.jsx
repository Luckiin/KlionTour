"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ThemeToggle";
import Reveal from "@/components/motion/Reveal";

import { translateAuthError } from "@/lib/utils";

import SplitText from "@/components/motion/SplitText";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha todos os campos"); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      router.refresh();
      router.push(user.role === "admin" ? "/admin" : "/painel");
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
            src="/executive_van_scenic_road_1776989174410.png"
            alt="Klion Journey"
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
              <Sparkles size={14} className="animate-pulse" /> Experiência Klion
            </p>
          </Reveal>
          
          <SplitText
            as="h2"
            className="font-serif text-5xl lg:text-7xl font-light leading-[1.02] tracking-tightest"
            text="Bem-vindo de volta ao"
            stagger={0.05}
          />
          <SplitText
            as="h2"
            className="font-serif text-5xl lg:text-7xl italic text-brand-300 font-light leading-[1.02] tracking-tightest mt-2"
            text="seu próximo destino."
            delay={0.5}
            stagger={0.05}
          />

          <Reveal direction="up" delay={1.2}>
            <p className="mt-8 text-white/70 text-lg leading-relaxed max-w-md font-light">
              Entre na sua conta para gerenciar suas viagens, cotações e aproveitar 
              o padrão Klion em cada detalhe.
            </p>
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-6">
             <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#060c1a] bg-brand-500/20 backdrop-blur-sm" />
                ))}
             </div>
             <div className="text-xs text-white/50">
                <span className="text-white font-bold block">+4.000 viagens</span>
                realizadas com sucesso.
             </div>
          </div>
          <div className="mt-8 text-[10px] uppercase tracking-[0.2em] text-white/30">
            © {new Date().getFullYear()} Klion Tour. Padrão Executivo de Qualidade.
          </div>
        </motion.div>
      </aside>

      {/* =============== FORM SECTION =============== */}
      <section className="relative flex flex-col p-6 lg:p-20 overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-lg mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-steel-500 hover:text-brand-500 transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Reveal direction="up" duration={0.8}>
              <span className="eyebrow">Acesso Cliente</span>
              <h1 className="display-2 mt-4">
                Bem-vindo <em className="not-italic text-brand-500 dark:text-brand-300">de volta.</em>
              </h1>
              <p className="lead mt-4 text-steel-500 dark:text-steel-400">
                Acesse sua conta para continuar sua jornada conosco.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.2} duration={0.8}>
              <form onSubmit={handleSubmit} className="mt-12 space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-300 bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4 shadow-sm"
                  >
                    <AlertCircle size={18} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-brand-900 dark:text-white/90 ml-1">
                    E-mail
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field input-icon !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all"
                      placeholder="exemplo@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-semibold text-brand-900 dark:text-white/90">
                      Senha
                    </label>
                    <Link href="#" className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field input-icon pr-12 !bg-surface-subtle/50 dark:!bg-surface-dark/50 focus:!bg-white dark:focus:!bg-surface-dark-elevated transition-all"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-400 hover:text-brand-500 transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-primary w-full py-4 text-base font-bold shadow-brand-500/20 active:scale-[0.98] transition-all mt-4"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={18} /></motion.div>
                      Autenticando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Entrar no painel <ArrowRight size={18} />
                    </div>
                  )}
                </button>
              </form>
            </Reveal>

            <Reveal direction="up" delay={0.4} duration={0.8}>
              <div className="mt-12 pt-8 border-t border-surface-border dark:border-surface-dark-border text-center">
                <p className="text-sm text-steel-500">
                  Ainda não tem uma conta?{" "}
                  <Link href="/auth/cadastro" className="text-brand-500 font-bold hover:text-brand-600 transition-colors">
                    Criar conta agora
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
