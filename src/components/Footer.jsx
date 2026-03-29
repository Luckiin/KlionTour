import Link from "next/link";
import { Truck, Phone, Mail, MapPin, Shield, CheckCircle, Award, Instagram, Facebook } from "lucide-react";
import { APP_NAME, APP_PHONE, APP_EMAIL, APP_ADDRESS, APP_CNPJ, APP_WHATSAPP } from "@/lib/constants";

export default function Footer() {
  const message = encodeURIComponent(
    "Olá, vim pelo site e gostaria fazer cotação de uma viagem"
  );

  return (
    <footer className="bg-dark-400 text-ink-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="text-center sm:text-left transition duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <div className="bg-brand-500 text-white p-2 rounded-xl">
                <Truck size={20} />
              </div>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </div>

            <p className="text-sm text-ink-400 leading-relaxed mb-4">
              Sua plataforma de fretamento de vans. Viaje com conforto, segurança e o melhor preço do mercado.
            </p>

            <div className="flex justify-center gap-3">
              <a
                href="https://www.instagram.com/kliontour"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-pink-500 hover:text-white hover:bg-gradient-to-tr hover:from-pink-500 hover:to-yellow-500 transition transform hover:scale-110"
              >
                <Instagram size={20} />
              </a>

              <a
                href="https://www.facebook.com/KLionTour"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-blue-600 hover:text-white hover:bg-blue-600 transition transform hover:scale-110"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="transition duration-300 hover:-translate-y-1">
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["/", "Início"],
                ["/cotacao", "Solicitar Cotação"],
                ["/sobre", "Sobre Nós"],
                ["/faq", "Perguntas Frequentes"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="relative hover:text-white transition after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-white after:transition-all hover:after:w-full"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="transition duration-300 hover:-translate-y-1">
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 group">
                <Phone size={15} className="text-brand-400 transition group-hover:scale-110" />
                {APP_PHONE}
              </li>
              <li className="flex items-center gap-2 group">
                <Mail size={15} className="text-brand-400 transition group-hover:scale-110" />
                {APP_EMAIL}
              </li>
              <li className="flex items-start gap-2 group">
                <MapPin size={15} className="text-brand-400 transition group-hover:scale-110 mt-0.5" />
                {APP_ADDRESS}
              </li>
            </ul>

            <a
              href={`https://wa.me/${APP_WHATSAPP}?text=${message}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-brand-500 text-white text-sm px-4 py-2 rounded-xl 
              hover:bg-brand-600 transition transform hover:scale-105 hover:shadow-lg"
            >
              💬 WhatsApp
            </a>
          </div>

          <div className="transition duration-300 hover:-translate-y-1">
            <h4 className="text-white font-semibold mb-4">Sua Segurança</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 group">
                <Shield size={15} className="text-brand-400 transition group-hover:scale-110" />
                Vans vistoriadas regularmente
              </li>
              <li className="flex items-center gap-2 group">
                <CheckCircle size={15} className="text-brand-400 transition group-hover:scale-110" />
                Motoristas habilitados
              </li>
              <li className="flex items-center gap-2 group">
                <Award size={15} className="text-brand-400 transition group-hover:scale-110" />
                Seguro de viagem incluso
              </li>
              <li className="flex items-center gap-2 group">
                <CheckCircle size={15} className="text-brand-400 transition group-hover:scale-110" />
                Rastreamento GPS
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados. CNPJ: {APP_CNPJ}
      </div>
    </footer>
  );
}