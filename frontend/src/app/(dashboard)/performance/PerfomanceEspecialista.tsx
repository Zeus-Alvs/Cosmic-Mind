'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ChevronDown } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

// ----- Tipos -----
interface Habilidades {
  Agilidade: number;
  Lógica: number;
  Memorização: number;
  Leitura: number;
  Interpretação: number;
  Concentração: number;
}

interface EstatisticasJogador {
  id_jogador: string;
  nome_jogador: string;
  total_partidas: number;
  total_acertos: number;
  total_erros: number;
  media_tempo_reacao_ms: number;
  pontuacao_maxima: number;
  habilidades: Habilidades;
}

interface JogadorItem {
  id: string;
  nome: string;
}

// ----- Mapa de cores por planeta (igual ao original) -----
const PLANETA_CORES: Record<string, string> = {
  netuno:   'bg-[#4A59BD]',
  urano:    'bg-[#38BDF8]',
  saturno:  'bg-[#C5A059]',
  jupiter:  'bg-[#A3A3A3]',
  marte:    'bg-[#A3A3A3]',
  terra:    'bg-[#A3A3A3]',
  venus:    'bg-[#A3A3A3]',
  mercurio: 'bg-[#A3A3A3]',
  sol:      'bg-[#A3A3A3]',
};

// Planetas exibidos na grade (ordem do original)
const PLANETAS_LISTA = [
  { id: 'netuno',   nome: 'Netuno'   },
  { id: 'urano',    nome: 'Urano'    },
  { id: 'saturno',  nome: 'Saturno'  },
  { id: 'jupiter',  nome: 'Júpiter'  },
  { id: 'marte',    nome: 'Marte'    },
  { id: 'terra',    nome: 'Terra'    },
  { id: 'venus',    nome: 'Vênus'    },
  { id: 'mercurio', nome: 'Mercúrio' },
  { id: 'sol',      nome: 'Pentas'   },
];

export default function PerfomanceS() {
  // ---- Estado do componente ----
  const [jogadores, setJogadores]       = useState<JogadorItem[]>([]);
  const [jogadorAtivo, setJogadorAtivo] = useState<JogadorItem | null>(null);
  const [isOpen, setIsOpen]             = useState(false);
  const [stats, setStats]               = useState<EstatisticasJogador | null>(null);
  const [carregando, setCarregando]     = useState(false);
  const [erro, setErro]                 = useState<string | null>(null);

  const radius       = 28;
  const circumference = 2 * Math.PI * radius;
    
  // ---- Buscar lista de jogadores do responsável logado ----
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('user_data') || '{}');
    const token   = localStorage.getItem('token_acesso') || '';

    if (!usuario?.id) return;
    fetch(`${getApiUrl()}/jogadores/${usuario.id}`)
      .then(r => r.json())
      .then((lista: { id: string; nome: string }[]) => {
        setJogadores(lista);
        if (lista.length > 0) setJogadorAtivo(lista[0]);
      })
      .catch(() => setErro('Não foi possível carregar os jogadores.'));
  }, []);

  // ---- Buscar estatísticas sempre que o jogador selecionado mudar ----
  useEffect(() => {
    if (!jogadorAtivo) return;

    setCarregando(true);
    setErro(null);
    setStats(null);

    const usuario = JSON.parse(localStorage.getItem('user_data') || '{}');
    const token   = localStorage.getItem('token_acesso') || '';

    fetch(`${getApiUrl()}/estatisticas/${jogadorAtivo.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((dados: EstatisticasJogador) => setStats(dados))
      .catch(() => setErro('Não foi possível carregar as estatísticas.'))
      .finally(() => setCarregando(false));
  }, [jogadorAtivo]);

  // ---- Quais planetas estão desbloqueados (baseado nas partidas reais) ----
  const planetasDesbloqueados = stats && stats.total_partidas > 0
    ? PLANETAS_LISTA.slice(0, 3).map(p => p.id)
    : [];

  // ---- Planetas com status calculated ----
  const planetas = PLANETAS_LISTA.map(p => ({
    ...p,
    cor:    PLANETA_CORES[p.id],
    status: planetasDesbloqueados.includes(p.id) ? 'Finalizado' : 'Bloqueado',
  }));

  // ---- Planeta clicado (para exibir detalhe das habilidades) ----
  const [planetaAtivo, setPlanetaAtivo] = useState<string | null>(null);

  // Habilidades a exibir no detalhe — sempre vêm da API
  const habilidades = stats?.habilidades ?? {
    Agilidade: 0, Lógica: 0, Memorização: 0,
    Leitura: 0, Interpretação: 0, Concentração: 0,
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-5 bg-transparent font-sans text-slate-600 overflow-hidden">

      {/* Cabeçalho */}
      <div className="mb-6 text-center">
        <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Desempenho do Jogador
        </h2>
        <p className="text-slate-400 text-xs font-medium">Selecione um planeta e veja o desempenho</p>
      </div>

      <div className="flex flex-row gap-8 items-start justify-center">

        {/* Coluna esquerda */}
        <div className="w-[260px] flex flex-col gap-4 shrink-0">

          {/* Dropdown de jogadores */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm flex items-center gap-3 hover:border-[#4A59BD]/40 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4A59BD] to-[#6372D6] flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                {jogadorAtivo ? jogadorAtivo.nome.charAt(0) : '?'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[10px] font-bold text-[#4A59BD] uppercase tracking-wider mb-0.5 opacity-70">Jogador</p>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-slate-700 truncate">
                    {jogadorAtivo?.nome ?? 'Nenhum jogador'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-slate-400 text-[9px] font-mono leading-none">ID: {jogadorAtivo?.id ?? '---'}</p>
              </div>
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2">
                  {jogadores.map(j => (
                    <li key={j.id}>
                      <button
                        onClick={() => { setJogadorAtivo(j); setIsOpen(false); setPlanetaAtivo(null); }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${jogadorAtivo?.id === j.id ? 'text-[#4A59BD] font-bold bg-blue-50/50' : 'text-slate-600 font-medium'}`}
                      >
                        {j.nome}
                        {jogadorAtivo?.id === j.id && <div className="w-1.5 h-1.5 rounded-full bg-[#4A59BD]" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Grade de planetas */}
          <div className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm">
            <h2 className="text-center font-semibold text-[#9D82CE] text-[10px] tracking-widest mb-4 opacity-80 uppercase">
              Progresso - Fase
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {planetas.map(p => {
                const isBloqueado = p.status === 'Bloqueado';
                return (
                  <button
                    key={p.id}
                    disabled={isBloqueado}
                    onClick={() => setPlanetaAtivo(p.id)}
                    className={`flex flex-col items-center gap-1.5 transition-all ${isBloqueado ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                  >
                    <div className={`w-10 h-10 rounded-full ${p.cor} flex items-center justify-center relative shadow-inner`}>
                      {isBloqueado && <Lock className="w-3.5 h-3.5 text-white" />}
                      {planetaAtivo === p.id && (
                        <div className="absolute -inset-1.5 border-2 border-[#4A59BD] rounded-full opacity-30" />
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 truncate w-full text-center">{p.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards de resumo */}
          {stats && (
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Total de partidas</span>
                <span className="font-semibold text-slate-700">{stats.total_partidas}</span>
              </div>
              <div className="flex justify-between">
                <span>Acertos totais</span>
                <span className="font-semibold text-green-600">{stats.total_acertos}</span>
              </div>
              <div className="flex justify-between">
                <span>Erros totais</span>
                <span className="font-semibold text-red-400">{stats.total_erros}</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo médio reação</span>
                <span className="font-semibold text-slate-700">{stats.media_tempo_reacao_ms} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Melhor pontuação</span>
                <span className="font-semibold text-[#4A59BD]">{stats.pontuacao_maxima}</span>
              </div>
            </div>
          )}
        </div>

        {/* Painel direito — gráficos de habilidades */}
        <div className="min-w-[480px] bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm self-stretch">
          {carregando && (
            <div className="flex items-center justify-center h-[340px] text-slate-300">
              <p className="text-xs tracking-widest uppercase">Carregando...</p>
            </div>
          )}

          {erro && !carregando && (
            <div className="flex items-center justify-center h-[340px] text-red-300">
              <p className="text-xs">{erro}</p>
            </div>
          )}

          {!carregando && !erro && planetaAtivo ? (
            <div className="flex flex-col animate-in fade-in duration-500 h-full">
              {/* Cabeçalho do planeta */}
              <div className="flex items-center gap-5 mb-6 pb-4 border-b border-slate-50">
                <div className={`w-12 h-12 rounded-2xl ${PLANETA_CORES[planetaAtivo]} shadow-sm`} />
                <div>
                  <h2 className="text-2xl font-semibold text-slate-700 leading-none capitalize">{planetaAtivo}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-green-50 text-green-500 rounded-full border border-green-100">
                      Finalizado
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                      {stats?.total_partidas ?? 0} partida(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Gráficos circulares por habilidade */}
              <div className="grid grid-cols-3 gap-x-10 gap-y-6 my-auto">
                {Object.entries(habilidades).map(([key, value]) => {
                  const offset = circumference - ((value as number) / 100) * circumference;
                  return (
                    <div key={key} className="flex flex-col items-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r={radius} stroke="#F1F5F9" strokeWidth="5" fill="transparent" />
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
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
            !carregando && !erro && (
              <div className="flex flex-col items-center justify-center h-[340px] text-slate-300">
                <p className="font-medium text-xs tracking-widest uppercase">
                  {stats?.total_partidas === 0
                    ? 'Nenhuma partida registrada ainda'
                    : 'Selecione uma fase liberada'}
                </p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}