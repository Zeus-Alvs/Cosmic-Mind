'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RequestsR from './RequestsResponsavel';
import RequestsS from './RequestsEspecialista';

export default function RequestsMaestro() {
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
        Carregando painel de solicitações...
      </div>
    );
  }

  if (tipoPerfil === 'responsavel') {
    return <RequestsR />;
  }

  if (tipoPerfil === 'especialista') {
    return <RequestsS />;
  }

  return <div>Perfil de acesso não reconhecido.</div>;
}