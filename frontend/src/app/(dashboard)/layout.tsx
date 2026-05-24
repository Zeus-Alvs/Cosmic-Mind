'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type Usuario = {
  nome: string;
  tipo_perfil: string;
  avatar?: number;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<Usuario>({
    nome: "",
    tipo_perfil: "",
  });

  const [autorizado, setAutorizado] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("user_data");

    if (!dadosSalvos) {
      router.push("../");
      return;
    }

    setUsuario(JSON.parse(dadosSalvos));
    setAutorizado(true);
  }, [router]);

  // Todos os botões agora possuem ambos os perfis liberados
  const links = [
    { 
      href: "/menu", 
      label: "Início", 
      icon: "/icons/home.png", 
      activeIcon: "/icons/home-active.png",
      roles: ["responsavel", "especialista"]
    },
    { 
      href: `/performance`, 
      label: "Desempenho", 
      icon: "/icons/dashboard.png", 
      activeIcon: "/icons/dashboard-active.png",
      roles: ["responsavel", "especialista"]
    },
    { 
      href: `/notifications`, 
      label: "Notificações", 
      icon: "/icons/bell.png", 
      activeIcon: "/icons/bell-active.png",
      roles: ["responsavel", "especialista"]
    },
    { 
      href: `/manager`, 
      label: "Gerenciar Contas", 
      icon: "/icons/users.png", 
      activeIcon: "/icons/users-active.png",
      roles: ["responsavel", "especialista"]
    },
    {
      href: `/requests`,
      label: "Solicitações",
      icon: "/icons/request.png",
      activeIcon: "/icons/request-active.png",
      roles: ["responsavel", "especialista"]
    },
    { 
      href: "/config", 
      label: "Ajustes", 
      icon: "/icons/config.png", 
      activeIcon: "/icons/config-active.png",
      roles: ["responsavel", "especialista"]
    },
  ];

  if (!autorizado) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Verificando segurança...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900">

      {/* 🔘 BOTÃO MOBILE */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg shadow-md cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* 🌑 OVERLAY MOBILE */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-40 w-64 bg-[#1E293B] text-white flex flex-col shadow-2xl h-full
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* LOGO */}
        <div className="pt-10 pb-6 px-6 flex items-center justify-center border-b border-slate-700/50">
          <Image
            src="/icons/logo.png"
            alt="Cosmic Mind"
            width={150}
            height={40}
            priority
            className="hover:scale-105 transition-transform"
          />
        </div>

        {/* MENU DINÂMICO */}
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          {links
            .filter((link) => link.roles.includes(usuario.tipo_perfil))
            .map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#4078A4] to-[#3E89AE] shadow-lg font-bold"
                        : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }
                  `}
                >
                  <Image
                    src={isActive ? link.activeIcon : link.icon}
                    alt={link.label}
                    width={20}
                    height={20}
                    className={`transition-transform duration-200 ${!isActive && "opacity-70 group-hover:opacity-100 group-hover:scale-110"}`}
                  />
                  <span className="text-sm tracking-wide">{link.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* USUÁRIO E LOGOUT */}
        <div className="p-4 mt-auto border-t border-slate-700/50 bg-slate-900/20">
          
          {/* Card do Usuário Clicável */}
          <Link 
            href="/account"
            className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-slate-700 transition-colors cursor-pointer group w-full"
          >
            <div className="w-10 h-10 rounded-full border-2 border-slate-600 shadow-inner overflow-hidden flex items-center justify-center shrink-0 bg-slate-800 group-hover:scale-105 transition-transform">
              <img 
                src={usuario.avatar ? `/usuarios/foto${usuario.avatar}.png` : "/usuarios/foto1.png"} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold truncate text-slate-100 group-hover:text-blue-300 transition-colors">
                {usuario.nome}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {usuario.tipo_perfil}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
          </Link>

          <div className="space-y-1">
            {/* Botão de Logout -> Adicionado cursor-pointer */}
            <button
              onClick={() => {
                localStorage.removeItem("user_data");
                localStorage.removeItem("token_acesso");
                router.push("../");
              }}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-slate-600/50 hover:border-red-500/50 transition-all text-sm font-medium group cursor-pointer"
            >
              <Image src="/icons/logout.png" alt="Sair" width={18} height={18} className="group-hover:scale-110 transition-transform" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full relative">
        {children}
      </main>

    </div>
  );
}