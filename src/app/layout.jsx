import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: {
    default: `${APP_NAME} - Fretamento de Vans`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Frete a van ideal para seu grupo. Conforto, segurança e preço justo.",
  keywords: ["fretamento", "van", "transporte", "viagem", "grupo"],
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
