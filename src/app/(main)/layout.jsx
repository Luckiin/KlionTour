import Header from "@/components/Header";
import Footer from "@/components/Footer";

// O redirect de rotas públicas/privadas é feito pelo middleware (src/middleware.js)
// antes de chegar aqui — não precisamos de lógica de auth no layout.
export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-surface-dark text-brand-900 dark:text-white">
      <Header />
      {/* pt-20 compensa o header fixed */}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
