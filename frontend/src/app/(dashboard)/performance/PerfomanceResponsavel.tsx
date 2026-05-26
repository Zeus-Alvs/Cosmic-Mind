'use client';

import { useState, useEffect } from 'react';
import { Lock, ChevronDown } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface Planeta {
  id: string; 
  nome: string;
  desafio: string;
  cor: string;
  imagem: string; // Nova propriedade para o nome do arquivo
}

export default function PerfomanceR() {
  const [jogadores, setJogadores] = useState<any[]>([]);
  const [jogadorAtivo, setJogadorAtivo] = useState<any>(null);
  
  const [estatisticasGlobais, setEstatisticasGlobais] = useState<any>(null);
  const [estatisticasPlaneta, setEstatisticasPlaneta] = useState<any>(null);
  
  const [planetaAtivo, setPlanetaAtivo] = useState<Planeta | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 👇 Adicionei os nomes dos arquivos png na propriedade "imagem" 👇
  const planetasBase: Planeta[] = [
    { id: '57b6d77617cbdc1499b06cab3d9f650e', nome: 'Netuno', desafio: 'Resgate Crítico', cor: 'bg-[#4A59BD]', imagem: 'netuno.png' },
    { id: 'urano', nome: 'Urano', desafio: 'Órbita Complexa', cor: 'bg-[#38BDF8]', imagem: 'urano.png' },
    { id: 'saturno', nome: 'Saturno', desafio: 'Anéis de Poeira', cor: 'bg-[#C5A059]', imagem: 'saturno.png' },
    { id: 'jupiter', nome: 'Júpiter', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'jupiter.png' },
    { id: 'marte', nome: 'Marte', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'marte.png' },
    { id: 'terra', nome: 'Terra', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'terra.png' },
    { id: 'venus', nome: 'Vênus', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'venus.png' },
    { id: 'mercurio', nome: 'Mercúrio', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'mercurio.png' },
    { id: 'sol', nome: 'Pentas', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'pentas.png' }, // Ajuste se o nome do arquivo for sol.png
  ];

  // 1. CARREGAR JOGADORES DO RESPONSÁVEL
  useEffect(() => {
    const buscarJogadores = async () => {
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;
        if (!token) return;

        const res = await fetch(`${getApiUrl()}/jogadores/${dadosSalvos.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setJogadores(data);
          if (data.length > 0) setJogadorAtivo(data[0]); 
        }
      } catch (error) {
        console.error("Erro ao buscar jogadores", error);
      }
    };
    buscarJogadores();
  }, []);

  // 2. BUSCAR DADOS GLOBAIS QUANDO O JOGADOR MUDA (Para saber os desbloqueios)
  useEffect(() => {
    if (!jogadorAtivo) return;

    const buscarGlobais = async () => {
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;

        const res = await fetch(`${getApiUrl()}/estatisticas/${jogadorAtivo.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setEstatisticasGlobais(data);
          setPlanetaAtivo(planetasBase[0]); // Começa com o Netuno selecionado
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas globais", error);
      }
    };

    buscarGlobais();
  }, [jogadorAtivo]);

  // 3. BUSCAR DADOS ESPECÍFICOS DO PLANETA SELECIONADO
  useEffect(() => {
    if (!jogadorAtivo || !planetaAtivo) return;

    const buscarPlaneta = async () => {
      setIsLoading(true);
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;

        const res = await fetch(`${getApiUrl()}/estatisticas/${jogadorAtivo.id}?planetId=${planetaAtivo.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setEstatisticasPlaneta(data);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas do planeta", error);
      } finally {
        setIsLoading(false);
      }
    };

    buscarPlaneta();
  }, [planetaAtivo, jogadorAtivo]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  if (jogadores.length === 0 && !isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen text-slate-400">
        Nenhum jogador vinculado à sua conta ainda.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-5 bg-transparent font-sans text-slate-600 overflow-hidden">
      <div className="mb-6 text-center">
        <div className="fixed top-0 left-0 md:left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Desempenho do Jogador
        </h2>
        <p className="text-slate-400 text-xs font-medium">Acompanhe a evolução cognitiva em tempo real</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        
        {/* COLUNA ESQUERDA: JOGADOR E PLANETAS */}
        <div className="w-full max-w-[260px] md:w-[260px] flex flex-col gap-4 shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm flex items-center gap-3 hover:border-[#4A59BD]/40 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-md border border-slate-200 group-hover:scale-105 transition-transform">
                 <img src={`/jogadores/foto${estatisticasGlobais?.foto_perfil || 1}.png`} alt="Avatar" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-[10px] font-bold text-[#4A59BD] uppercase tracking-wider mb-0.5 opacity-70">Jogador</p>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-slate-700 truncate">{jogadorAtivo?.nome || "Carregando..."}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-slate-400 text-[9px] font-mono leading-none tracking-widest">CÓD: {jogadorAtivo?.codigo_vinculo}</p>
              </div>
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {jogadores.map((j) => (
                    <li key={j.id}>
                      <button
                        onClick={() => {
                          setJogadorAtivo(j);
                          setIsOpen(false);
                        }}
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

          <div className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm">
            <h2 className="text-center font-semibold text-[#9D82CE] text-[10px] tracking-widest mb-4 opacity-80 uppercase">Mapa de Fases</h2>
            <div className="grid grid-cols-3 gap-4">
              {planetasBase.map((p, index) => {
                const isBloqueado = index > 0 && !estatisticasGlobais?.planetas_liberados?.includes(p.id);

                return (
                  <button
                    key={p.id}
                    disabled={isBloqueado}
                    onClick={() => setPlanetaAtivo(p)}
                    className={`flex flex-col items-center gap-1.5 transition-all ${isBloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                  >
                    {/* Alterado aqui: Container da imagem com overlay */}
                    <div className="relative w-10 h-10">
                      <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner">
                        <img 
                          src={`/game/${p.imagem}`} 
                          alt={p.nome} 
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay escuro se estiver bloqueado */}
                        {isBloqueado && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-white/90" />
                          </div>
                        )}
                      </div>

                      {/* Borda de seleção (fora do overflow-hidden para não cortar) */}
                      {planetaAtivo?.id === p.id && !isBloqueado && (
                        <div className="absolute -inset-1.5 border-2 border-[#4A59BD] rounded-full opacity-40 pointer-events-none" />
                      )}
                    </div>

                    <span className="text-[9px] font-medium text-slate-400 truncate w-full text-center mt-1">{p.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: ESTATÍSTICAS REAIS DO BACKEND */}
        <div className="w-full md:min-w-[480px] bg-white border border-slate-100 p-6 md:p-8 rounded-[2.5rem] shadow-sm self-stretch flex flex-col">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-slate-300 animate-pulse">
               Calculando métricas cognitivas...
             </div>
          ) : estatisticasPlaneta && planetaAtivo ? (
            <div className="flex flex-col animate-in fade-in duration-500 h-full">
              <div className="flex items-center gap-5 mb-6 pb-4 border-b border-slate-50">
                
                {/* Alterado aqui: Avatar do planeta no cabeçalho das stats */}
                <div className="w-12 h-12 rounded-2xl shadow-sm overflow-hidden flex items-center justify-center bg-slate-100">
                  <img 
                    src={`/game/${planetaAtivo.imagem}`} 
                    alt={planetaAtivo.nome} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-slate-700 leading-none">Visão Global - {planetaAtivo.nome}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                      {estatisticasPlaneta.total_partidas} Partidas Jogadas
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                      Top Score: {estatisticasPlaneta.pontuacao_maxima} pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-10 gap-y-6 my-auto">
                {Object.entries(estatisticasPlaneta.habilidades).map(([key, value]) => {
                  const valorReal = Number(value) || 0; 
                  const offset = circumference - (valorReal / 100) * circumference;
                  
                  return (
                    <div key={key} className="flex flex-col items-center group">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r={radius} stroke="#F1F5F9" strokeWidth="5" fill="transparent" />
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke={valorReal > 0 ? "#4A59BD" : "#E2E8F0"} 
                            strokeWidth="5" fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out group-hover:stroke-[#AC57EB]"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center leading-none">
                          <span className="text-base font-semibold text-slate-700">{valorReal}</span>
                          <span className="text-[9px] font-medium text-slate-400">%</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-2 tracking-tight text-center w-20 leading-tight group-hover:text-slate-600 transition-colors">
                        {key}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <p className="font-medium text-xs tracking-widest uppercase">Selecione uma fase liberada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}