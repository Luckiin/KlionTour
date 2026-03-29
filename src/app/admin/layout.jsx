"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Truck, LayoutDashboard, FileText, DollarSign, LogOut, ShieldAlert, Users, Settings, UserCheck, Bus } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { useEffect } from "react";

const NAV = [
  { href: "/admin",             icon: <LayoutDashboard size={18} />, label: "Visão Geral"  },
  { href: "/admin/cotacoes",    icon: <FileText size={18} />,        label: "Cotações"     },
  { href: "/admin/financeiro",  icon: <DollarSign size={18} />,      label: "Financeiro"   },
  { href: "/admin/clientes",    icon: <Users size={18} />,            label: "Clientes"     },
  { href: "/admin/motoristas",  icon: <UserCheck size={18} />,        label: "Motoristas"   },
  { href: "/admin/veiculos",    icon: <Bus size={18} />,              label: "Veículos"     },
];

export default function AdminLayout({ children }) {
  const { user, logout, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/auth/entrar");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-400">
        <div className="text-white text-center">
          <ShieldAlert size={48} className="mx-auto mb-3 text-ink-400" />
          <p className="text-ink-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-300">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-400 text-ink-100 flex flex-col fixed inset-y-0 left-0 z-40 shadow-xl">
        <div className="p-5 border-b border-dark-50">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-brand-500 text-white p-2 rounded-xl"><Truck size={20} /></div>
            <div>
              <div className="text-white font-bold text-sm">{APP_NAME}</div>
              <div className="text-xs text-ink-400">Painel Administrativo</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-brand-500 text-white shadow"
                  : "text-ink-300 hover:bg-dark-200 hover:text-white"
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-50 space-y-1">
          {/* Link para o site público */}
          <Link href="/"
            className="flex items-center gap-2 text-sm text-ink-400 hover:text-brand-400 px-3 py-2 rounded-lg hover:bg-dark-200 w-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Ver site público
          </Link>

          <div className="flex items-center gap-2 mb-1 px-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-ink-400 truncate">{user.email}</div>
            </div>
          </div>
          <button onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 text-sm text-ink-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-900/20 w-full transition">
            <LogOut size={16} /> Sair do admin
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-64">
        <main className="p-8 min-h-screen bg-dark-300">{children}</main>
      </div>
    </div>
  );
}
