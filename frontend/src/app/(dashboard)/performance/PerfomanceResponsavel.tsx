'use client';

import { useState } from 'react';
import { Lock, ChevronDown, User } from 'lucide-react';

const JOGADORES = [
  { id: '001', nome: 'Ana Souza' },
  { id: '002', nome: 'Davi Souza' }
];

interface Planeta {
  id: string;
  nome: string;
  status: 'Finalizado' | 'Em andamento' | 'Bloqueado';
  desafio: string;
  cor: string;
  stats: {
    Agilidade: number;
    Lógica: number;
    Memorização: number;
    Leitura: number;
    Interpretação: number;
    Concentração: number;
  };
}

export default function PerfomanceR() {
  const [jogador, setJogador] = useState(JOGADORES[0]);
  const [planetaAtivo, setPlanetaAtivo] = useState<Planeta | null>(null);
  const [isOpen, setIsOpen] = useState(false); // Estado para o Dropdown

  const planetas: Planeta[] = [
    { id: 'netuno', nome: 'Netuno', status: 'Finalizado', desafio: 'Resgate Crítico', cor: 'bg-[#4A59BD]', stats: { Agilidade: 85, Lógica: 70, Memorização: 60, Leitura: 90, Interpretação: 75, Concentração: 80 } },
    { id: 'urano', nome: 'Urano', status: 'Finalizado', desafio: 'Órbita Complexa', cor: 'bg-[#38BDF8]', stats: { Agilidade: 65, Lógica: 76, Memorização: 80, Leitura: 55, Interpretação: 70, Concentração: 60 } },
    { id: 'saturno', nome: 'Saturno', status: 'Finalizado', desafio: 'Anéis de Poeira', cor: 'bg-[#C5A059]', stats: { Agilidade: 76, Lógica: 76, Memorização: 76, Leitura: 76, Interpretação: 76, Concentração: 76 } },
    { id: 'jupiter', nome: 'Júpiter', status: 'Bloqueado', desafio: '---', cor: 'bg-[#A3A3A3]', stats: { Agilidade: 0, Lógica: 0, Memorização: 0, Leitura: 0, Interpretação: 0, Concentração: 0 } },
    { id: 'marte', nome: 'Marte', status: 'Bloqueado', desafio: '---', cor: 'bg-[#A3A3A3]', stats: { Agilidade: 0, Lógica: 0, Memorização: 0, Leitura: 0, Interpretação: 0, Concentração: 0 } },
    { id: 'terra', nome: 'Terra', status: 'Bloqueado', desafio: '---', cor: 'bg-[#A3A3A3]', stats: { Agilidade: 0, Lógica: 0, Memorização: 0, Leitura: 0, Interpretação: 0, Concentração: 0 } },
    { id: 'venus', nome: 'Vênus', status: 'Bloqueado', desafio: '---', cor: 'bg-[#A3A3A3]', stats: { Agilidade: 0, Lógica: 0, Memorização: 0, Leitura: 0, Interpretação: 0, Concentração: 0 } },
    { id: 'mercurio', nome: 'Mercúrio', status: 'Bloqueado', desafio: '---', cor: 'bg-[#A3A3A3]', stats: { Agilidade: 0, Lógica: 0, Memorização: 0, Leitura: 0, Interpretação: 0, Concentração: 0 } },
    { id: 'sol', nome: 'Pentas', status: 'Bloqueado', desafio: '---', cor: 'bg-[#A3A3A3]', stats: { Agilidade: 0, Lógica: 0, Memorização: 0, Leitura: 0, Interpretação: 0, Concentração: 0 } },
  ];

  const radius = 28; 
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full max-w-6xl mx-auto p-5 bg-transparent font-sans text-slate-600 overflow-hidden">
      
      <div className="mb-6 text-center">
        <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Desempenho do Jogador
        </h2>
        <p className="text-slate-400 text-xs font-medium">Selecione um planeta e veja o desempenho</p>
      </div>

      <div className="flex flex-row gap-8 items-start justify-center">
        
        {/* COLUNA ESQUERDA */}
        <div className="w-[260px] flex flex-col gap-4 shrink-0">
          
          {/* NOVO DROPDOWN CUSTOMIZADO */}
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm flex items-center gap-3 hover:border-[#4A59BD]/40 transition-all duration-300 group"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4A59BD] to-[#6372D6] flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                {jogador.nome.charAt(0)}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <p className="text-[10px] font-bold text-[#4A59BD] uppercase tracking-wider mb-0.5 opacity-70">Jogador</p>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-slate-700 truncate">{jogador.nome}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-slate-400 text-[9px] font-mono leading-none">ID: {jogador.id}</p>
              </div>
            </button>

            {/* Lista Suspensa com Animação */}
            {isOpen && (
              <>
                {/* Overlay transparente para fechar ao clicar fora */}
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                
                <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {JOGADORES.map((j) => (
                    <li key={j.id}>
                      <button
                        onClick={() => {
                          setJogador(j);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${jogador.id === j.id ? 'text-[#4A59BD] font-bold bg-blue-50/50' : 'text-slate-600 font-medium'}`}
                      >
                        {j.nome}
                        {jogador.id === j.id && <div className="w-1.5 h-1.5 rounded-full bg-[#4A59BD]" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* MENU DE PLANETAS */}
          <div className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm">
            <h2 className="text-center font-semibold text-[#9D82CE] text-[10px] tracking-widest mb-4 opacity-80 uppercase">Progresso - Fase</h2>
            <div className="grid grid-cols-3 gap-4">
              {planetas.map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => p.status !== 'Bloqueado' && setPlanetaAtivo(p)}
                  className={`flex flex-col items-center gap-1.5 transition-all ${p.status === 'Bloqueado' ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  <div className={`w-10 h-10 rounded-full ${p.cor} flex items-center justify-center relative shadow-inner`}>
                    {p.status === 'Bloqueado' && <Lock className="w-3.5 h-3.5 text-white" />}
                    {planetaAtivo?.id === p.id && (
                      <div className="absolute -inset-1.5 border-2 border-[#4A59BD] rounded-full opacity-30" />
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-slate-400 truncate w-full text-center">{p.nome}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: CARD DE GRÁFICOS */}
        <div className="min-w-[480px] bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm self-stretch">
          {planetaAtivo ? (
            <div className="flex flex-col animate-in fade-in duration-500 h-full">
              <div className="flex items-center gap-5 mb-6 pb-4 border-b border-slate-50">
                <div className={`w-12 h-12 rounded-2xl ${planetaAtivo.cor} shadow-sm flex items-center justify-center`} />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-700 leading-none">{planetaAtivo.nome}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-green-50 text-green-500 rounded-full border border-green-100">
                      {planetaAtivo.status}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                      {planetaAtivo.desafio}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-x-10 gap-y-6 my-auto">
                {Object.entries(planetaAtivo.stats).map(([key, value]) => {
                  const offset = circumference - (value / 100) * circumference;
                  return (
                    <div key={key} className="flex flex-col items-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r={radius} stroke="#F1F5F9" strokeWidth="5" fill="transparent" />
                          <circle 
                            cx="40" cy="40" r={radius} 
                            stroke="#4A59BD" strokeWidth="5" fill="transparent" 
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center leading-none">
                          <span className="text-base font-semibold text-slate-700">{value}</span>
                          <span className="text-[9px] font-medium text-slate-400">%</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-2 tracking-tight text-center w-20 leading-tight">
                        {key}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[340px] text-slate-300">
               <p className="font-medium text-xs tracking-widest uppercase">Selecione uma fase liberada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}