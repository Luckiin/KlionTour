"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck, Mail, Lock, Eye, EyeOff, AlertCircle, User,
  Phone, ArrowLeft, CheckCircle, FileText, MapPin, Building2, Map, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";

const BENEFITS = [
  "Solicite cotações oficiais com preço garantido",
  "Acompanhe o status das suas viagens",
  "Histórico completo de pedidos",
  "Suporte prioritário",
];

// Redirect de usuário já logado é feito pelo middleware antes de chegar aqui.
export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    documento: "",
    isEmpresa: false,
    endereco: "",
    cidade: "",
    cep: "",
    estado: "",
    celular: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados novos apenas para a lista de sugestões
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const maskCEP = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
  const maskPhone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const maskCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14);
  const maskCNPJ = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 18);

  // Lógica de busca automática por nome de rua (Nominatim - Grátis)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Só busca se o usuário digitou mais de 5 letras e não acabou de clicar em uma sugestão
      if (form.endereco.length > 5 && !isSearching) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.endereco)}&addressdetails=1&limit=5&countrycodes=br`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (err) {
          console.error("Erro na busca", err);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.endereco]);

  const selectSuggestion = (item) => {
    setIsSearching(true);
    const addr = item.address;

    setForm(prev => ({
      ...prev,
      endereco: item.display_name.split(',')[0] + (addr.house_number ? `, ${addr.house_number}` : ''),
      cidade: addr.city || addr.town || addr.village || prev.cidade,
      cep: addr.postcode ? maskCEP(addr.postcode) : prev.cep,
      estado: addr.state || prev.estado
    }));

    setShowSuggestions(false);
    // Pequeno timeout para permitir que o usuário digite novamente depois se quiser
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.refresh(); // Sincroniza cookies/middleware
      router.push("/painel");
    } catch (err) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex flex-col selection:bg-brand-500/30">
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-300 hover:text-ink-100 text-sm transition">
          <ArrowLeft size={16} /> Voltar ao início
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Lado Esquerdo */}
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="bg-brand-500 text-white p-2.5 rounded-xl shadow">
                <Truck size={24} />
              </div>
              <span className="text-2xl font-bold text-ink-100">{APP_NAME}</span>
            </div>
            <h2 className="text-4xl font-extrabold text-ink-100 mb-6 leading-tight">
              Viaje melhor com <br />
              <span className="text-brand-400">sua conta exclusiva.</span>
            </h2>
            <ul className="space-y-4">
              {BENEFITS.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-ink-200">
                  <CheckCircle size={20} className="text-emerald-500" />
                  <span className="text-base font-medium">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado Direito */}
          <div className="relative w-full">
            <div className="card p-8 relative z-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-ink-100">Crie sua conta</h1>
                <p className="text-ink-300 text-sm mt-1">Preencha os dados abaixo para começar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Nome completo</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type="text" value={form.nomeCompleto} onChange={(e) => update("nomeCompleto", e.target.value)} className="input-field input-icon" placeholder="Seu nome" />
                    </div>
                  </div>

                  {/* Campo Email */}
                  <div>
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">E-mail</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field input-icon" placeholder="seu@email.com" />
                    </div>
                  </div>

                  {/* Campo WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">WhatsApp</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type="tel" value={form.celular} onChange={(e) => update("celular", maskPhone(e.target.value))} className="input-field input-icon" placeholder="(00) 00000-0000" />
                    </div>
                  </div>

                  {/* Campo Documento */}
                  <div>
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Documento {form.isEmpresa ? "(CNPJ)" : "(CPF)"}</label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type="text" value={form.documento} onChange={(e) => update("documento", form.isEmpresa ? maskCNPJ(e.target.value) : maskCPF(e.target.value))} className="input-field input-icon" placeholder={form.isEmpresa ? "00.000.000/0000-00" : "000.000.000-00"} />
                    </div>
                  </div>

                  {/* Endereço Inteligente */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Endereço Principal</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type="text" value={form.endereco} onChange={(e) => { update("endereco", e.target.value); setIsSearching(false); }} onFocus={() => setIsSearching(false)} className="input-field input-icon" placeholder="Ex: Av Paulista, 1000..." />
                    </div>
                    {/* Autocomplete */}
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 bg-dark-200 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {suggestions.map((item, idx) => (
                          <li key={idx}>
                            <button type="button" onClick={() => selectSuggestion(item)} className="w-full text-left px-4 py-3 text-sm text-ink-200 hover:bg-brand-500/20 hover:text-white border-b border-white/5 last:border-0 transition flex flex-col items-start gap-1">
                              <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-ink-400 mt-0.5 shrink-0" />
                                <span className="font-semibold text-white truncate">{item.display_name.split(',')[0]}</span>
                              </div>
                              <span className="text-xs text-ink-300 ml-5">{item.display_name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Complementos de Endereço */}
                  <div>
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Cidade</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type="text" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} className="input-field input-icon" placeholder="Cidade" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Estado / CEP</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.estado} onChange={(e) => update("estado", e.target.value)} className="input-field w-1/3 text-center uppercase" placeholder="UF" maxLength={2} />
                      <input type="text" value={form.cep} onChange={(e) => update("cep", maskCEP(e.target.value))} className="input-field w-2/3" placeholder="00000-000" />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink-200 mb-1.5">Sua Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input type={showPass ? "text" : "password"} value={form.senha} onChange={(e) => update("senha", e.target.value)} className="input-field input-icon" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-brand-400 transition">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Empresa Checkbox */}
                  <div className="md:col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" id="isEmpresa" checked={form.isEmpresa} onChange={(e) => update("isEmpresa", e.target.checked)} className="rounded border-ink-400 text-brand-500 focus:ring-brand-500 w-4 h-4 bg-transparent" />
                    <label htmlFor="isEmpresa" className="text-sm font-medium text-ink-200 cursor-pointer">Sou uma empresa (Pessoa Jurídica)</label>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base flex justify-center items-center gap-2 shadow-lg hover:shadow-brand-500/25">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Criar minha conta"}
                  </button>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-ink-300">
                    Já tem uma conta? <Link href="/auth/entrar" className="text-brand-400 hover:text-brand-300 font-bold transition">Faça login aqui</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}