import Link from "next/link";
import {
  Phone, Mail, MapPin, Shield, CheckCircle, Award,
  Instagram, Facebook, ArrowUpRight,
} from "lucide-react";
import {
  APP_NAME, APP_PHONE, APP_EMAIL, APP_ADDRESS, APP_CNPJ, APP_WHATSAPP,
} from "@/lib/constants";

export default function Footer() {
  const message = encodeURIComponent(
    "Olá, vim pelo site e gostaria de fazer a cotação de uma viagem."
  );

  return (
    <footer className="relative overflow-hidden bg-brand-900 text-white">
      {/* Ornamento de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-brand-500/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-20 w-[460px] h-[460px] rounded-full bg-brand-300/10 blur-3xl animate-blob" />
        <div className="absolute inset-0 bg-grid-dark bg-[size:48px_48px] opacity-30" />
      </div>

      <div className="container-x py-8 relative z-10">
        {/* CTA topo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
          <div>
            <p className="eyebrow !text-brand-300">Vamos viajar juntos?</p>
            <h3 className="font-serif font-light text-4xl md:text-5xl mt-4 max-w-xl leading-tight">
              Sua próxima viagem começa com <em className="not-italic text-brand-300">uma conversa.</em>
            </h3>
          </div>
          <a
            href={`https://wa.me/${APP_WHATSAPP}?text=${message}`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 text-lg font-medium hover:text-brand-300 transition"
          >
            Falar pelo WhatsApp
            <span className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-all group-hover:rotate-45">
              <ArrowUpRight size={18} />
            </span>
          </a>
        </div>

        {/* Colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-10">
          {/* Marca */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-300 flex items-center justify-center">
                <span className="font-serif text-white text-lg leading-none">K</span>
              </div>
              <span className="font-serif text-xl tracking-tight">{APP_NAME}</span>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-xs">
              Fretamento de vans com conforto, segurança e a transparência que sua viagem merece.
            </p>

            <div className="flex gap-2">
              <SocialIcon href="https://www.instagram.com/kliontour" label="Instagram">
                <Instagram size={16} />
              </SocialIcon>
              <SocialIcon href="https://www.facebook.com/KLionTour" label="Facebook">
                <Facebook size={16} />
              </SocialIcon>
            </div>
          </div>

          {/* Navegação */}
          <FooterCol title="Navegação">
            {[
              ["/", "Início"],
              ["/cotacao", "Solicitar cotação"],
              ["/sobre", "Sobre nós"],
              ["/faq", "Perguntas frequentes"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="link-anim text-sm text-white/70 hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </FooterCol>

          {/* Contato */}
          <FooterCol title="Contato">
            <li className="flex items-center gap-2 text-sm text-white/70">
              <Phone size={14} className="text-brand-300" /> {APP_PHONE}
            </li>
            <li className="flex items-center gap-2 text-sm text-white/70">
              <Mail size={14} className="text-brand-300" /> {APP_EMAIL}
            </li>
            <li className="flex items-start gap-2 text-sm text-white/70">
              <MapPin size={14} className="text-brand-300 mt-0.5" /> {APP_ADDRESS}
            </li>
          </FooterCol>

          {/* Segurança */}
          <FooterCol title="Sua segurança">
            <li className="flex items-center gap-2 text-sm text-white/70">
              <Shield size={14} className="text-brand-300" /> Vans vistoriadas
            </li>
            <li className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle size={14} className="text-brand-300" /> Motoristas habilitados
            </li>
            <li className="flex items-center gap-2 text-sm text-white/70">
              <Award size={14} className="text-brand-300" /> Seguro incluso
            </li>
            <li className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle size={14} className="text-brand-300" /> Rastreamento GPS
            </li>
          </FooterCol>
        </div>

        {/* Base */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.</p>
          <p>CNPJ: {APP_CNPJ}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold tracking-widest uppercase text-white/90 mb-5">
        {title}
      </h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-white hover:text-brand-900 hover:border-white transition-all duration-300 hover:scale-105"
    >
      {children}
    </a>
  );
}
