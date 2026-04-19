import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: {
    default: `${APP_NAME} - Fretamento de Vans`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Frete a van ideal para seu grupo. Conforto, segurança e preço justo.",
  keywords: ["fretamento", "van", "transporte", "viagem", "grupo"],
  themeColor: "#19335a",
};

// Evita flash de tema ao carregar: aplica a classe `dark` antes do React montar
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
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
