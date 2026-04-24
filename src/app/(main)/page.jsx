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

import { POPULAR_ROUTES } from "@/lib/constants";

const STATS = [
  { to: 4000, suffix: "+", label: "Viagens realizadas" },
  { to: 96,   suffix: "%", label: "Clientes satisfeitos" },
  { to: 24,   suffix: "h", label: "Suporte disponível" },
];

const HOW_IT_WORKS = [
  { icon: <Search size={22} />,      step: "01", title: "Simule gratuitamente", desc: "Informe origem, destino, data e quantidade de passageiros." },
  { icon: <FileText size={22} />,    step: "02", title: "Crie sua conta",        desc: "Cadastro rápido e prático para realizar a cotação oficial." },
  { icon: <DollarSign size={22} />,  step: "03", title: "Receba sua cotação",    desc: "Preço personalizado conforme as suas necessidades." },
  { icon: <CheckCircle size={22} />, step: "04", title: "Confirme e viaje",      desc: "Reserve sua van e viaje com total tranquilidade." },
];

const TESTIMONIALS = [
  { name: "Maria Silva",   city: "Salvador · Rio Vermelho",     text: "Serviço impecável. A van chegou no horário e o motorista foi muito atencioso. Já é minha opção favorita.", rating: 5 },
  { name: "João Santos",   city: "Salvador · Praia de Ipitanga", text: "Viagem confortável e segura. Já é a terceira vez que uso e sempre supera as expectativas.", rating: 5 },
  { name: "Ana Oliveira",  city: "Salvador · Itapuã",            text: "Preço justo e qualidade excelente. Fiz o fretamento para o casamento da minha filha e foi perfeito.", rating: 5 },
];

export const metadata = { title: "Início" };

export default function HomePage() {
  return (
    <>
      {/* =============== HERO ABSTRATO PREMIUM =============== */}
      <section id="hero" className="relative min-h-[95vh] flex items-center justify-center w-full -mt-20 pt-20 overflow-visible">
        {/* Background layers */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#02040a]">
          {/* Mesh Gradients Dinâmicos Profundos */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-900/40 blur-[140px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-500/20 blur-[120px] rounded-full" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-brand-400/15 blur-[100px] rounded-full animate-bounce-slow" />
          
          {/* Brilho central para evitar o "vazio" */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(70,117,192,0.1),transparent_70%)]" />
          
          {/* Textura de ruído / grão sutil */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Overlay de gradiente linear para profundidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02040a]/80 via-transparent to-[#050810]" />
          
          {/* Grid de luxo sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container-x relative z-10 w-full flex flex-col items-center text-center pt-16 pb-24 md:pb-28">
          <Reveal direction="fade" duration={0.8}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-[0.22em] uppercase font-medium text-white bg-white/10 border border-white/20 backdrop-blur-md mb-8">
              <Sparkles size={13} className="text-brand-300" />
              Fretamento executivo de vans
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
                <Link href="#simular" className="btn-primary text-base px-10 py-4 shadow-glow-blue scale-110">
                  Simular viagem <ArrowRight size={18} />
                </Link>
                <Link href="/sobre" className="group inline-flex items-center gap-3 text-white/70 hover:text-white text-sm font-medium transition-colors">
                  <span className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-brand-900 transition-all duration-500">
                    <ArrowRight size={14} />
                  </span>
                  Conhecer a Klion
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Simulador flutuante - Corrigido para não ser cortado */}
        <div id="simular" className="absolute inset-x-0 bottom-0 translate-y-1/2 container-x z-20">
          <Reveal direction="up" delay={0.6} duration={0.9}>
            <SimulationHeroForm />
          </Reveal>
        </div>
      </section>

      {/* Espaço maior para acomodar o simulador e evitar o "vazio escuro" */}
      <div className="h-20 md:h-24" />

      {/* =============== STATS =============== */}
      <section className="container-x pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-6">
          {STATS.map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 0.1}>
              <div className="text-center md:text-left border-t border-surface-border dark:border-surface-dark-border pt-6">
                <div className="font-serif text-5xl md:text-6xl font-light text-brand-500 dark:text-brand-300 tracking-tightest">
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <p className="mt-3 text-sm tracking-widest uppercase text-steel-500 dark:text-steel-400">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
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

      {/* =============== ROTAS POPULARES =============== */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_ROUTES.map((route, i) => (
              <Reveal key={i} direction="up" delay={i * 0.1}>
                <Link
                  href="#hero"
                  className="card card-hover group block p-7 relative overflow-hidden"
                >
                  {/* Decorativo no fundo */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <span className="text-4xl">{route.emoji}</span>
                    <div className="text-right">
                      <div className="text-[10px] tracking-[0.22em] uppercase text-steel-500 dark:text-steel-400">
                        a partir de
                      </div>
                      <div className="font-serif text-2xl text-brand-500 dark:text-brand-300 mt-1">
                        R$ {route.basePrice.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <MapPin size={14} className="text-brand-500" />
                    <span className="text-sm font-medium text-brand-900 dark:text-white">
                      {route.from}
                    </span>
                    <ArrowRight size={13} className="text-steel-500 group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm font-medium text-brand-900 dark:text-white">
                      {route.to}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-steel-500 dark:text-steel-400 relative z-10">
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} /> {route.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Navigation size={11} /> {route.distance}
                    </span>
                  </div>

                  <div className="mt-7 pt-5 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs font-medium text-brand-500 relative z-10">
                    Simular esta rota
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============== DEPOIMENTOS =============== */}
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

      {/* =============== CTA FINAL =============== */}
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
