'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Usuario = {
  nome: string;
  tipo_perfil: string;
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
      router.push("/login");
      return;
    }

    setUsuario(JSON.parse(dadosSalvos));
    setAutorizado(true);
  }, [router]);

  // Define se o usuário logado é especialista (S) ou responsável (R)
  const isEspecialista = usuario.tipo_perfil === "especialista";
  const suffix = isEspecialista ? "/S" : "/R";

  const links = [
    { 
      href: "/", 
      label: "Início", 
      icon: "/icons/home.png", 
      activeIcon: "/icons/home-active.png" 
    },
    { 
      href: `/performance${suffix}`, 
      label: "Desempenho", 
      icon: "/icons/dashboard.png", 
      activeIcon: "/icons/dashboard-active.png" 
    },
    { 
      href: `/notifications${suffix}`, 
      label: "Notificações", 
      icon: "/icons/bell.png", 
      activeIcon: "/icons/bell-active.png" 
    },
    { 
      href: `/manager${suffix}`, 
      label: "Gerenciar Contas", 
      icon: "/icons/users.png", 
      activeIcon: "/icons/users-active.png" 
    },
    {
      href: `/requests${suffix}`,
      label: "Solicitações",
      icon: "/icons/request.png",
      activeIcon: "/icons/request-active.png",
    },
    { 
      href: "/config", 
      label: "Ajustes", 
      icon: "/icons/config.png", 
      activeIcon: "/icons/config-active.png" 
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
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* 🌑 OVERLAY MOBILE */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-40 w-64 bg-slate-800 text-white flex flex-col shadow-xl h-full
          transform transition-transform duration-300
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >

        {/* LOGO */}
        <div className="pt-11 pb-5 px-6 flex items-center">
          <Image
            src="/icons/logo.png"
            alt="Cosmic Mind"
            width={150}
            height={40}
            priority
          />
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 space-y-2 mt-10">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-slate-700 scale-[1.02]"
                      : "hover:bg-slate-700 hover:scale-[1.02]"
                  }
                `}
              >
                <Image
                  src={isActive ? link.activeIcon : link.icon}
                  alt={link.label}
                  width={20}
                  height={20}
                />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USUÁRIO */}
        <div className="p-4 mt-auto pb-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg uppercase">
              {usuario.nome ? usuario.nome.charAt(0) : ""}
            </div>

            <div>
              <p className="text-sm font-bold truncate w-32">
                {usuario.nome}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {usuario.tipo_perfil}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("user_data");
              router.push("/login");
            }}
            className="flex items-center justify-center gap-2 w-full p-2 rounded-lg border border-slate-600 hover:bg-red-500 hover:border-red-500 transition text-sm"
          >
            <Image src="/icons/logout.png" alt="Sair" width={18} height={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        {children}
      </main>

    </div>
  );
}