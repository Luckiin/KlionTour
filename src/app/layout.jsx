import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: {
    default: `${APP_NAME} - Fretamento de Vans`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Frete a van ideal para seu grupo. Conforto, segurança e preço justo.",
  keywords: ["fretamento", "van", "transporte", "viagem", "grupo"],
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport = {
  themeColor: "#19335a",
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('klion-theme');
    if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
