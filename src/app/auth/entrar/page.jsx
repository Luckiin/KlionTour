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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface dark:bg-surface-dark text-brand-900 dark:text-white">
      {/* =============== PAINEL VISUAL =============== */}
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
            <Sparkles size={14} /> Bem-vindo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="font-serif text-5xl lg:text-6xl font-light leading-[1.05] mt-4"
          >
            Onde você vai hoje?
            <span className="block italic text-brand-200 mt-2">A van está pronta.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 text-white/80 text-lg leading-relaxed max-w-md"
          >
            Entre na sua conta e gerencie suas cotações, acompanhe o status das viagens
            e viva cada deslocamento com conforto Klion.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-xs text-white/60"
        >
          © {new Date().getFullYear()} {APP_NAME}. Uma viagem de cada vez.
        </motion.div>
      </aside>

      {/* =============== FORM =============== */}
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

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md">
            <Reveal direction="up">
              <span className="eyebrow">Entrar</span>
              <h1 className="display-2 mt-3">Bem-vindo <em className="not-italic text-brand-500 dark:text-brand-300">de volta.</em></h1>
              <p className="lead mt-3">
                Acesse sua conta para continuar.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3"
                  >
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-brand-900 dark:text-white mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field input-icon"
                      placeholder="seu@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-brand-900 dark:text-white">Senha</label>
                    <Link href="#" className="text-xs text-brand-500 hover:underline">Esqueci a senha</Link>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field input-icon pr-12"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-500 hover:text-brand-500 transition"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
                  {loading ? "Entrando…" : <>Entrar <ArrowRight size={16} /></>}
                </button>
              </form>
            </Reveal>

            <Reveal direction="up" delay={0.2}>
              <p className="text-center text-sm text-steel-500 mt-8">
                Não tem conta?{" "}
                <Link href="/auth/cadastro" className="text-brand-500 font-medium hover:underline">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
