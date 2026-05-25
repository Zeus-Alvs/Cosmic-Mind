'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Activity, Users } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface PlayerPerformanceDTO {
  id: string;
  nome: string;
  progresso: number;
  tempoUso: string;
  nivelFase: string;
  pontuacao: number;
  foto_perfil?: number;
  codigo_vinculo?: string;
}

export default function ManagerS() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [players, setPlayers] = useState<PlayerPerformanceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👇 Busca os pacientes e ENRIQUECE com as estatísticas reais do Back-end
  const loadPlayers = async () => {
    try {
      const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
      const token = dadosSalvos.token_acesso;

      if (!token) {
        setIsLoading(false);
        return;
      }

      // 1. Busca a lista básica de pacientes vinculados a este especialista
      const response = await fetch(`${getApiUrl()}/vinculo/meus-pacientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const pacientesBase = await response.json();

        // 2. Para cada paciente, busca as estatísticas para preencher o card
        const pacientesEnriquecidos = await Promise.all(
          pacientesBase.map(async (paciente: any) => {
            try {
              const resStats = await fetch(`${getApiUrl()}/estatisticas/${paciente.id || paciente._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (resStats.ok) {
                const stats = await resStats.json();
                
                // Calcula o progresso baseado na quantidade de planetas liberados
                const qtdPlanetas = stats.planetas_liberados?.length || 0;
                let progressoCalc = Math.round((qtdPlanetas / 9) * 100);
                if (progressoCalc > 100) progressoCalc = 100;

                return {
                  id: paciente.id || paciente._id,
                  nome: paciente.nome || paciente.apelido || "Paciente",
                  foto_perfil: stats.foto_perfil || paciente.foto_perfil || 1,
                  codigo_vinculo: paciente.codigo_vinculo || stats.codigo_vinculo,
                  progresso: progressoCalc,
                  tempoUso: `${stats.total_partidas} partidas`,
                  nivelFase: qtdPlanetas > 0 ? `Planeta ${qtdPlanetas}` : 'Iniciante',
                  pontuacao: stats.pontuacao_maxima || 0
                };
              }
            } catch (err) {
              console.error(`Erro ao buscar stats do paciente ${paciente.nome}`, err);
            }

            // Fallback caso a rota de estatísticas falhe
            return {
              id: paciente.id || paciente._id,
              nome: paciente.nome || "Paciente",
              foto_perfil: paciente.foto_perfil || 1,
              codigo_vinculo: paciente.codigo_vinculo,
              progresso: 0,
              tempoUso: '0 partidas',
              nivelFase: 'Iniciante',
              pontuacao: 0
            };
          })
        );

        setPlayers(pacientesEnriquecidos);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const nextSlide = () => {
    if (currentIndex < players.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (isLoading) return <div className="text-center p-10 text-slate-400 font-bold">Carregando pacientes...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center">
      <div className="fixed top-0 left-0 md:left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Pacientes Acompanhados
        </h2>
        <p className="text-slate-400 text-xs mt-1">Selecione um paciente para analisar as métricas cognitivas</p>
      </div>

      {players.length === 0 ? (
        <div className="bg-slate-50/50 rounded-[35px] border border-slate-200 p-12 flex flex-col items-center justify-center text-center mt-10 w-full max-w-md">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">Nenhum paciente vinculado</h3>
          <p className="text-xs text-slate-400">
            Vá até a aba "Gerenciar Pacientes" para enviar uma solicitação de vínculo através do código do jogador.
          </p>
          <button 
            onClick={() => router.push('/requests')}
            className="mt-6 bg-[#4078A4] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#3E89AE] transition-colors cursor-pointer"
          >
            Vincular Paciente
          </button>
        </div>
      ) : (
        <>
          <div className="relative w-full flex items-center justify-center h-[350px]">
            <button
              onClick={prevSlide}
              className={`absolute left-0 lg:left-10 z-[100] p-2 transition-all cursor-pointer ${currentIndex === 0 ? 'opacity-10 pointer-events-none' : 'hover:scale-110 text-slate-400'}`}
            >
              <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 stroke-[1px]" />
            </button>

            <div className="relative flex items-center justify-center w-full">
              {players.map((card, index) => {
                const isCenter = index === currentIndex;
                const isLeft = index === currentIndex - 1;
                const isRight = index === currentIndex + 1;
                const isVisible = isCenter || isLeft || isRight;

                return (
                  <div
                    key={card.id}
                    className={`
                      absolute transition-all duration-500 ease-in-out rounded-[35px] shadow-lg
                      ${isCenter ? 'z-50 scale-100 opacity-100 shadow-2xl translate-x-0' : ''}
                      ${isLeft ? 'z-30 scale-[0.82] opacity-30 -translate-x-[120px] md:-translate-x-[240px] blur-[1px]' : ''}
                      ${isRight ? 'z-30 scale-[0.82] opacity-30 translate-x-[120px] md:translate-x-[240px] blur-[1px]' : ''}
                      ${!isVisible ? 'opacity-0 scale-50 z-0 pointer-events-none' : ''}
                      bg-[#F2ECEF] border border-white
                    `}
                    style={{ width: '100%', maxWidth: '340px', height: '260px' }}
                  >
                    <div className="p-8 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                            <img src={`/jogadores/foto${card.foto_perfil || 1}.png`} alt={card.nome} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-md font-bold text-slate-800 leading-tight truncate">{card.nome}</h3>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase text-slate-400">Cód:</span>
                              <span 
                                className="text-xs font-mono font-bold bg-white text-[#AC57EB] px-2 py-0.5 rounded-md tracking-widest border border-[#AC57EB]/20 shadow-sm"
                                title="Código de vínculo do paciente"
                              >
                                {card.codigo_vinculo || '----'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="#D1D5DB" strokeWidth="6" fill="transparent" />
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              stroke="#AC57EB"
                              strokeWidth="6"
                              fill="transparent"
                              strokeDasharray={163.3}
                              strokeDashoffset={163.3 - (163.3 * card.progresso) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-black text-slate-700">{card.progresso}%</span>
                        </div>
                      </div>

                      <div className="space-y-1 ml-1">
                        <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Atividade:</span>{card.tempoUso}</p>
                        <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Fase Atual:</span>{card.nivelFase}</p>
                        <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Top Score:</span>{card.pontuacao} pts</p>
                      </div>

                      <button
                        // 👇 Redirecionamento ajustado para /performance
                        onClick={() => router.push(`/performance`)}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3E89AE] to-[#AC57EB] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Activity className="w-4 h-4" />
                        Ver Análise Completa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={nextSlide}
              className={`absolute right-0 lg:right-10 z-[100] p-2 transition-all cursor-pointer ${currentIndex === players.length - 1 ? 'opacity-10 pointer-events-none' : 'hover:scale-110 text-slate-400'}`}
            >
              <ChevronRight className="w-8 h-8 md:w-12 md:h-12 stroke-[1px]" />
            </button>
          </div>

          <div className="flex gap-2 mt-8">
            {players.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-10 bg-[#AC57EB]' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}