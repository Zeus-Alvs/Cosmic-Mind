"use client";

import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- Importamos o redirecionador

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const [usuario, setUsuario] = useState({ nome: '', tipo_perfil: '' });
  const [autorizado, setAutorizado] = useState(false); // <-- Estado de Segurança

  useEffect(() => {
    // 1. Vai na gaveta ver se tem alguém logado
    const dadosSalvos = localStorage.getItem('user_data');
    
    if (dadosSalvos) {
      // Se tem dados, libera a entrada e carrega o nome
      setUsuario(JSON.parse(dadosSalvos));
      setAutorizado(true);
    } else {
      // Se NÃO tem dados, expulsa pro login na mesma hora
      router.push('/login');
    }
  }, [router]);

  // 2. Tela de carregamento enquanto o cadeado checa a gaveta
  // Isso evita que a tela pisque pro invasor antes de ser expulso
  if (!autorizado) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Verificando segurança...</p>
      </div>
    );
  }

  // === SE PASSAR PELO CADEADO, MOSTRA O PAINEL ===
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">Cosmic Mind</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <Link href="/" className="block p-3 rounded-lg hover:bg-slate-700 transition">🏠 Início</Link>
          <Link href="/performance" className="block p-3 rounded-lg hover:bg-slate-700 transition">📊 Desempenho</Link>
          <Link href="/manager" className="block p-3 rounded-lg hover:bg-slate-700 transition">👥 Gerenciar Contas</Link>
          <Link href="/notifications" className="block p-3 rounded-lg hover:bg-slate-700 transition">🔔 Notificações</Link>
          <Link href="/config" className="block p-3 rounded-lg hover:bg-slate-700 transition">⚙️ Ajustes</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-700 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg uppercase shadow-inner">
              {usuario.nome ? usuario.nome.charAt(0) : ''}
            </div>
            <div>
              <p className="text-sm font-bold truncate w-32">{usuario.nome}</p>
              <p className="text-xs text-slate-400 capitalize">{usuario.tipo_perfil}</p>
            </div>
          </div>
          
          {/* BOTÃO SAIR (Limpa a gaveta e volta pro login) */}
          <button 
            onClick={() => {
              localStorage.removeItem('user_data');
              router.push('/login');
            }}
            className="mt-4 block w-full text-center p-2 rounded-lg border border-slate-600 hover:bg-red-500 hover:border-red-500 transition text-sm cursor-pointer"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto w-full relative">
        {children}
      </main>

    </div>
  );
}