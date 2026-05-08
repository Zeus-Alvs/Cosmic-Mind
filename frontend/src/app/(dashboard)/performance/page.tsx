'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PerfomanceS from './PerfomanceEspecialista';
import PerfomanceR from './PerfomanceResponsavel';

export default function NotificationsMaestro() {
  const router = useRouter();
  const [tipoPerfil, setTipoPerfil] = useState<string | null>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("user_data");
    
    if (!dadosSalvos) {
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(dadosSalvos);
    setTipoPerfil(usuario.tipo_perfil);
  }, [router]);

  if (!tipoPerfil) {
    return (
      <div className="flex justify-center items-center h-full text-slate-400 font-bold">
        Carregando painel de desempenho...
      </div>
    );
  }

  if (tipoPerfil === 'responsavel') {
    return <PerfomanceR />;
  }

  if (tipoPerfil === 'especialista') {
    return <PerfomanceS />;
  }

  return <div>Perfil de acesso não reconhecido.</div>;
}