import Link from "next/link";
import SimulationHeroForm from "@/components/SimulationHeroForm";
import {
  ArrowRight,
  Search,
  Star,
  Clock,
  Navigation,
  CheckCircle,
  Zap,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

import { POPULAR_ROUTES, VANS, APP_PHONE } from "@/lib/constants";

const STATS = [
  { value: "4.000+", label: "Viagens realizadas" },
  { value: "96%", label: "Clientes satisfeitos" },
  { value: "24h", label: "Suporte disponível" },
];

const HOW_IT_WORKS = [
  { icon: <Search size={26} />, step: 1, title: "Simule gratuitamente", desc: "Informe origem, destino, data e quantidade de passageiros." },
  { icon: <FileText size={26} />, step: 2, title: "Crie sua conta", desc: "Cadastro rápido e prático para realizar a cotação oficial personalizada." },
  { icon: <DollarSign size={26} />, step: 3, title: "Realize a cotação", desc: "Realize a cotação conforme as suas necessidades." },
  { icon: <CheckCircle size={26} />, step: 4, title: "Confirme e viaje!", desc: "Reserve sua van e viaje com total tranquilidade." },
];

const TESTIMONIALS = [
  { name: "Maria Silva", city: "Salvador - Rio Vermelho", text: "Serviço impecável! A van chegou no horário e o motorista foi muito atencioso. Já é minha opção favorita.", rating: 5 },
  { name: "João Santos", city: "Salvador - Praia de ipitanga", text: "Viagem confortável e segura. Já é a terceira vez que uso e sempre supera as expectativas.", rating: 5 },
  { name: "Ana Oliveira", city: "Salvador - Itapuã", text: "Preço justo e qualidade excelente. Fiz o fretamento para o casamento da minha filha e foi perfeito.", rating: 5 },
];

export const metadata = { title: "Início" };

export default function HomePage() {
  return (
    <>
      <section id="hero" className="relative text-white min-h-[650px] flex items-center w-full">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-dark-400 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center animate-ken-burns opacity-60" />
          {/* Overlay to darken and transition to stats section */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-300 via-dark-400/80 to-dark-400/30" />
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative z-10 flex flex-col justify-center">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 bg-dark-200/50 backdrop-blur-md rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-brand-500/20">
              <Zap size={14} className="text-brand-500 animate-pulse" />
              Fretamento de Vans
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-2xl">
              Viaje com seu grupo com <br className="hidden md:block" />
              <span className="text-brand-400 font-black">conforto e segurança</span>
            </h1>

            <p className="text-lg md:text-xl text-ink-200 mb-8 max-w-2xl font-medium drop-shadow-md">
              Frete a van ideal para sua viagem sem complicações. Cotação rápida e instantânea, direto da tela inicial.
            </p>
          </div>

          <div className="-mb-40 md:-mb-48 mt-4 w-full relative z-20">
            <SimulationHeroForm />
          </div>
        </div>
      </section>

      <section className="bg-dark-300 border-y border-brand-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="transition duration-300 hover:-translate-y-2 hover:scale-105"
              >
                <div className="text-2xl md:text-3xl font-extrabold text-brand-400">
                  {s.value}
                </div>
                <div className="text-sm text-ink-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dark-300 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Como funciona</h2>
            <p className="text-ink-300 max-w-xl mx-auto">
              Em poucos passos, você contrata a van ideal para seu grupo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={i}
                className="text-center group transition hover:-translate-y-2"
              >
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 bg-brand-900 text-brand-400 rounded-2xl flex items-center justify-center transition group-hover:bg-brand-500 group-hover:text-white group-hover:scale-110">
                    {item.icon}
                  </div>

                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 text-white rounded-full text-xs font-bold flex items-center justify-center group-hover:scale-110">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-semibold text-ink-100 mb-2 group-hover:text-white">
                  {item.title}
                </h3>

                <p className="text-sm text-ink-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">Rotas Populares</h2>
              <p className="text-ink-300">
                As viagens mais procuradas pelos nossos clientes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href="#hero"
                className="card p-6 transition group block hover:-translate-y-2 hover:shadow-xl hover:border-brand-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl group-hover:scale-110 transition">
                    {route.emoji}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-ink-400">a partir de</div>
                    <div className="text-xl font-bold text-brand-400">
                      R$ {route.basePrice.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="text-sm font-semibold text-ink-100">
                    {route.from}
                  </span>
                  <ArrowRight size={13} />
                  <span className="text-sm font-semibold text-ink-100">
                    {route.to}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-ink-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {route.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation size={11} /> {route.distance}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-dark-400 to-dark-300 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Pronto para sua próxima viagem?
          </h2>

          <p className="text-brand-200 mb-8 text-lg">
            Realize o cadastro e descubra o melhor preço para seu grupo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/cadastro"
              className="bg-dark-200 text-brand-400 px-8 py-3.5 rounded-xl font-semibold transition shadow-lg inline-flex items-center justify-center gap-2 hover:scale-105"
            >
              <ArrowRight size={18} /> Criar Conta
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}