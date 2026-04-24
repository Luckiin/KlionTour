import Link from "next/link";
import SimulationHeroForm from "@/components/SimulationHeroForm";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import Parallax from "@/components/motion/Parallax";
import Counter from "@/components/motion/Counter";
import {
  ArrowRight,
  Search,
  Star,
  Clock,
  Navigation,
  CheckCircle,
  Sparkles,
  FileText,
  DollarSign,
  MapPin,
  Quote,
} from "lucide-react";

// Removido import duplicado de POPULAR_ROUTES

const STATS = [
  { to: 4000, suffix: "+", label: "Viagens realizadas", icon: <Navigation size={24} className="text-brand-500" /> },
  { to: 96, suffix: "%", label: "Clientes satisfeitos", icon: <Star size={24} className="text-brand-500" /> },
  { to: 24, suffix: "h", label: "Suporte disponível", icon: <Clock size={24} className="text-brand-500" /> },
];

const POPULAR_ROUTES = [
  {
    title: "Praia do Forte",
    from: "Salvador",
    price: 600,
    time: "1h e 12m",
    dist: "69km",
    image: "/beach_resort_brazil_1776989240613.png"
  },
  {
    title: "Chapada Diamantina",
    from: "Salvador",
    price: 6000,
    time: "7h e 30m",
    dist: "476km",
    image: "/mountain_canyon_nature_1776989257496.png"
  },
  {
    title: "Porto de Sauípe",
    from: "Salvador",
    price: 2000,
    time: "1h e 45m",
    dist: "96km",
    image: "/coastal_village_brazil_1776989275955.png"
  }
];

const HOW_IT_WORKS = [
  { icon: <Search size={22} />, step: "01", title: "Simule gratuitamente", desc: "Informe origem, destino, data e quantidade de passageiros." },
  { icon: <FileText size={22} />, step: "02", title: "Crie sua conta", desc: "Cadastro rápido e prático para realizar a cotação oficial." },
  { icon: <DollarSign size={22} />, step: "03", title: "Receba sua cotação", desc: "Preço personalizado conforme as suas necessidades." },
  { icon: <CheckCircle size={22} />, step: "04", title: "Confirme e viaje", desc: "Reserve sua van e viaje com total tranquilidade." },
];

const TESTIMONIALS = [
  { name: "Maria Silva", city: "Salvador · Rio Vermelho", text: "Serviço impecável. A van chegou no horário e o motorista foi muito atencioso. Já é minha opção favorita.", rating: 5 },
  { name: "João Santos", city: "Salvador · Praia de Ipitanga", text: "Viagem confortável e segura. Já é a terceira vez que uso e sempre supera as expectativas.", rating: 5 },
  { name: "Ana Oliveira", city: "Salvador · Itapuã", text: "Preço justo e qualidade excelente. Fiz o fretamento para o casamento da minha filha e foi perfeito.", rating: 5 },
];

export const metadata = { title: "Início" };

export default function HomePage() {
  return (
    <>
      {/* =============== HERO ABSTRATO PREMIUM =============== */}
      <section id="hero" className="relative min-h-[95vh] flex items-center justify-center w-full -mt-20 pt-20 overflow-visible">
        {/* Background layers with Image */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#060c1a]">
          {/* Main Image Background */}
          <div className="absolute inset-0 opacity-70 lg:opacity-85">
            <img
              src="/vibrant_executive_van_daylight_1776989629178.png"
              alt="Executive Van"
              className="w-full h-full object-cover animate-ken-burns"
            />
            {/* Gradientes mais quentes e suaves */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060c1a]/40 via-transparent to-[#060c1a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060c1a]/30 via-transparent to-[#060c1a]/30" />
          </div>

          {/* Mesh Gradients mais vibrantes e coloridos */}
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-brand-400/10 blur-[100px] rounded-full" />

          {/* Textura sutil para profundidade */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise" />
        </div>

        <div className="container-x relative z-10 w-full flex flex-col items-center text-center pt-16 pb-24 md:pb-28">
          <Reveal direction="fade" duration={0.8}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-[0.22em] uppercase font-medium text-white bg-white/10 border border-white/20 backdrop-blur-md mb-8">
              <Sparkles size={13} className="text-brand-300" />
              Fretamento de vans
            </div>
          </Reveal>

          <div className="max-w-4xl">
            <SplitText
              as="h1"
              className="display-1 !text-white mb-2"
              text="Viaje com seu grupo com"
              stagger={0.08}
            />
            <SplitText
              as="h1"
              className="display-1 !text-brand-300 italic font-light"
              text="conforto e segurança."
              delay={0.45}
              stagger={0.08}
            />

            <Reveal direction="up" delay={1.1} duration={0.8}>
              <p className="mt-6 lead !text-white/80 max-w-2xl">
                Frete a van ideal para a sua viagem sem complicações.
                Cotação instantânea, motoristas qualificados e um cuidado
                que você sente do primeiro clique ao destino final.
              </p>
            </Reveal>

            <Reveal direction="up" delay={1.3} duration={0.7}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6">

              </div>
            </Reveal>
          </div>

          <div id="simular" className="absolute inset-x-0 bottom-0 translate-y-1/2 container-x z-20">
            <SimulationHeroForm />
          </div>
        </div>
      </section>

      <div className="h-20 md:h-24" />

      {/* =============== STATS (CARD STYLE) =============== */}
      <section className="container-x relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-10">
          {STATS.map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 0.1}>
              <div className="bg-white dark:bg-surface-dark-elevated p-8 rounded-3xl shadow-xl border border-surface-border dark:border-surface-dark-border flex items-center gap-6 group hover:border-brand-500/30 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/5 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div>
                  <div className="font-serif text-3xl text-brand-900 dark:text-white font-bold leading-none mb-1">
                    <Counter to={s.to} suffix={s.suffix} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-steel-500 dark:text-steel-400 font-bold">
                    {s.label}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =============== CONFORTO PREMIUM =============== */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container-x grid lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-gradient blur-3xl opacity-10 rounded-[2.5rem]" />
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-surface-subtle">
                <img
                  src="/executive_van_interior_1776989194121.png"
                  alt="Luxo e Conforto"
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-surface-dark-elevated p-6 rounded-2xl shadow-xl border border-surface-border dark:border-surface-dark-border max-w-[200px]">
                <div className="flex items-center gap-2 text-brand-500 mb-2">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs font-bold text-brand-900 dark:text-white uppercase tracking-widest">Padrão Executivo de Qualidade</p>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right">
            <div className="flex flex-col">
              <span className="eyebrow text-brand-500">Experiência Klion</span>
              <h2 className="display-2 mt-4 mb-6">Mais que uma viagem, um <em className="not-italic text-brand-500 italic">momento de luxo.</em></h2>
              <p className="lead text-steel-600 dark:text-steel-400 mb-8">
                Nossas vans são equipadas com o que há de melhor em tecnologia e conforto. Bancos em couro reclináveis, Wi-Fi de alta velocidade, ar-condicionado digital e motoristas treinados para o atendimento VIP.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Poltronas reclináveis", "Ar-condicionado dual",
                  "Wi-Fi & USB", "Bagageiro amplo",
                  "Seguro passageiro", "Rastreamento 24h"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-brand-900 dark:text-white">
                    <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                      <CheckCircle size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =============== HUMAN CENTRIC =============== */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        <div className="container-x grid lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <div className="flex flex-col">
              <span className="eyebrow text-brand-500">Compromisso Klion</span>
              <h2 className="display-2 mt-4 mb-6">Viagens feitas para <em className="not-italic text-brand-500 italic">conectar pessoas.</em></h2>
              <p className="lead text-steel-600 dark:text-steel-400 mb-8">
                Não somos apenas uma plataforma de transporte. Somos facilitadores de momentos especiais. Seja uma viagem em família, um evento corporativo ou uma excursão com amigos, cuidamos de cada detalhe para que sua única preocupação seja aproveitar o caminho.
              </p>

              <div className="flex items-center gap-6 p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10">
                <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                  <Star size={20} fill="currentColor" />
                </div>
                <p className="text-sm font-medium text-brand-900 dark:text-white">
                  "O atendimento humano e a pontualidade nos surpreenderam. Recomendo a todos os meus parceiros."
                  <span className="block text-xs text-brand-500 mt-1 font-bold">— Ricardo Mendes, Diretor Comercial</span>
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-gradient blur-3xl opacity-10 rounded-[2.5rem]" />
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="/happy_travelers_van_1776989822644.png"
                  alt="Viajantes Felizes"
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =============== COMO FUNCIONA =============== */}
      <section className="relative pt-12 pb-12 md:pt-16 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-brand-50/60 dark:bg-surface-dark-elevated/40" />
        <div className="absolute inset-x-0 top-0 h-px hr-fancy" />

        <div className="container-x">
          <div className="max-w-3xl">
            <Reveal>
              <span className="eyebrow">Processo</span>
              <h2 className="display-2 mt-3">
                Simples, transparente,
                <em className="not-italic text-brand-500 dark:text-brand-300"> sem complicação.</em>
              </h2>
              <p className="lead mt-6 max-w-xl">
                Em quatro passos você contrata a van ideal para o seu grupo.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px mt-10 bg-surface-border dark:bg-surface-dark-border overflow-hidden rounded-3xl border border-surface-border dark:border-surface-dark-border">
            {HOW_IT_WORKS.map((item, i) => (
              <Reveal key={i} direction="up" delay={i * 0.08}>
                <div className="group relative h-full bg-surface-elevated dark:bg-surface-dark-elevated p-8 md:p-10 transition-all duration-500 hover:bg-brand-500 hover:text-white">
                  <div className="flex items-center justify-between mb-10">
                    <span className="font-serif text-sm tracking-widest text-steel-500 group-hover:text-white/70 transition">
                      {item.step}
                    </span>
                    <span className="w-11 h-11 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:bg-white group-hover:text-brand-500 transition">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-brand-900 dark:text-white group-hover:text-white transition mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-steel-500 dark:text-steel-300 group-hover:text-white/80 transition">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pt-12 pb-12 md:pt-16 md:pb-16 overflow-hidden">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <Reveal>
              <span className="eyebrow">Destinos</span>
              <h2 className="display-2 mt-4">Rotas que inspiram.</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="lead max-w-md">
                As viagens mais procuradas por quem já conhece o serviço Klion.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_ROUTES.map((route, i) => (
              <Reveal key={i} direction="up" delay={i * 0.1}>
                <Link
                  href="#hero"
                  className="group relative block h-[420px] rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-2"
                >
                  <img
                    src={route.image}
                    alt={route.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/40 to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                        {route.from}
                      </span>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-widest text-white/60 mb-0.5">A partir de</div>
                        <div className="text-xl font-serif text-brand-300">R$ {route.price.toLocaleString("pt-BR")}</div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-brand-300 transition-colors">
                      {route.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-white/70 mb-6">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} /> {route.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Navigation size={12} /> {route.dist}
                      </span>
                    </div>

                    <div className="pt-5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      Simular agora
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pt-12 pb-12 md:pt-16 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-50/50 to-transparent dark:via-surface-dark-elevated/30" />

        <div className="container-x">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal>
              <span className="eyebrow">Depoimentos</span>
              <h2 className="display-2 mt-4">
                Quem viaja com a Klion,
                <em className="not-italic text-brand-500 dark:text-brand-300"> volta.</em>
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} direction="up" delay={i * 0.12}>
                <figure className="card p-8 h-full flex flex-col">
                  <Quote size={28} className="text-brand-300 mb-5" />
                  <blockquote className="font-serif text-lg leading-relaxed text-brand-900 dark:text-white flex-1">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-8 pt-6 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-brand-900 dark:text-white">
                        {t.name}
                      </div>
                      <div className="text-xs text-steel-500 dark:text-steel-400 mt-0.5">
                        {t.city}
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-brand-500 dark:text-brand-300">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 overflow-hidden">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-gradient text-white p-8 md:p-14 shadow-soft-lg">
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <Parallax amount={40} className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-white/10 blur-3xl" />
                <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] opacity-20" />
              </div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="eyebrow !text-brand-200">Pronto para embarcar?</span>
                  <h2 className="font-serif font-light text-4xl md:text-6xl leading-[1.05] tracking-tightest mt-5">
                    Sua próxima viagem
                    <span className="block italic text-brand-200"> começa aqui.</span>
                  </h2>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-white/80 text-lg">
                    Cadastre-se em menos de um minuto e descubra o melhor preço para o seu grupo.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Link href="/auth/cadastro" className="inline-flex items-center gap-2 bg-white text-brand-900 px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-brand-100 transition hover:-translate-y-0.5 shadow-soft-lg">
                      Criar conta <ArrowRight size={16} />
                    </Link>
                    <Link href="/cotacao" className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition">
                      Ver cotação
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
