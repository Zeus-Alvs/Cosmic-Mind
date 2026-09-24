"use client";
import { Check } from 'lucide-react';

import { Star, Brain, Hand } from 'lucide-react';


import { useEffect, useState } from "react";

type Usuario = {
  nome: string;
  tipo_perfil: string;
};

export default function Home() {
  const [usuario, setUsuario] = useState<Usuario>({
    nome: "",
    tipo_perfil: "",
  });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("user_data");

    if (dadosSalvos) {
      setUsuario(JSON.parse(dadosSalvos));
    }
  }, []);

  return (
    <div className="h-full overflow-hidden relative">

      <div className="fixed top-0 left-0 md:left-64 right-0 h-1.5 bg-[#4078A4] z-50" />

      <div className="h-screen flex items-start justify-center pt-20 px-4 md:px-0">

        <div className="w-full max-w-3xl px-4 md:px-10">

          {}
          <h2 className="mb-10 flex items-center gap-3 flex-wrap">

            <span className="text-2xl md:text-3xl"><Hand className="w-5 h-5 inline-block" /></span>

            <span className="text-xl md:text-2xl font-semibold bg-[#4078A4]    bg-clip-text text-transparent">
              Olá,{" "}
              <span className="font-bold">
                {usuario.nome}
              </span>
            </span>

          </h2>

          {}
          <div className="flex flex-col gap-6 max-w-xl ml-auto w-full">

            <div className="bg-cyan-100/60 backdrop-blur p-5 md:p-6 rounded-2xl border border-cyan-200 shadow-sm">

              <p className="text-slate-700 text-sm mb-3">
                Este é o <strong className="text-cyan-700">painel administrativo</strong> do Cosmic Mind.
              </p>

              <p className="text-slate-700 text-sm mb-2">
                <Brain className="w-5 h-5 inline-block" /> Use o menu ao lado para:
              </p>

              <ul className="space-y-1 text-slate-700 text-sm ml-4">
                <li><Check className="w-5 h-5 inline-block" /> Acompanhar desempenho</li>
                <li><Check className="w-5 h-5 inline-block" /> Personalizar perfis</li>
                <li><Check className="w-5 h-5 inline-block" /> Ver relatórios</li>
              </ul>

            </div>

            <div className="bg-white border border-cyan-200 rounded-xl p-4 shadow-sm">

              <p className="text-cyan-600 text-sm font-bold mb-1">
                <Star className="w-5 h-5 inline-block" /> Dica
              </p>

              <p className="text-slate-600 text-sm">
                Clique em <strong>"Início"</strong> para voltar sempre aqui.
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}