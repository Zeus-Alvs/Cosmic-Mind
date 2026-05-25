'use client';

import { useState, useEffect } from 'react';
import { Lock, ChevronDown, FileText } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface Planeta {
  id: string; 
  nome: string;
  desafio: string;
  cor: string;
}

export default function PerfomanceS() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteAtivo, setPacienteAtivo] = useState<any>(null);
  
  const [estatisticasGlobais, setEstatisticasGlobais] = useState<any>(null);
  const [estatisticasPlaneta, setEstatisticasPlaneta] = useState<any>(null);
  
  const [planetaAtivo, setPlanetaAtivo] = useState<Planeta | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Lista de planetas (ID do Netuno já atualizado)
  const planetasBase: Planeta[] = [
    { id: '57b6d77617cbdc1499b06cab3d9f650e', nome: 'Netuno', desafio: 'Resgate Crítico', cor: 'bg-[#4A59BD]' },
    { id: 'urano', nome: 'Urano', desafio: 'Órbita Complexa', cor: 'bg-[#38BDF8]' }, 
    { id: 'saturno', nome: 'Saturno', desafio: 'Anéis de Poeira', cor: 'bg-[#C5A059]' }, 
    { id: 'jupiter', nome: 'Júpiter', desafio: '---', cor: 'bg-[#A3A3A3]' },
    { id: 'marte', nome: 'Marte', desafio: '---', cor: 'bg-[#A3A3A3]' },
    { id: 'terra', nome: 'Terra', desafio: '---', cor: 'bg-[#A3A3A3]' },
    { id: 'venus', nome: 'Vênus', desafio: '---', cor: 'bg-[#A3A3A3]' },
    { id: 'mercurio', nome: 'Mercúrio', desafio: '---', cor: 'bg-[#A3A3A3]' },
    { id: 'sol', nome: 'Pentas', desafio: '---', cor: 'bg-[#A3A3A3]' },
  ];

  // 1. CARREGAR PACIENTES DO ESPECIALISTA
  useEffect(() => {
    const buscarPacientes = async () => {
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;
        if (!token) return;

        // 👇 Rota correta para especialistas!
        const res = await fetch(`${getApiUrl()}/vinculo/meus-pacientes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setPacientes(data);
          if (data.length > 0) setPacienteAtivo(data[0]); 
        }
      } catch (error) {
        console.error("Erro ao buscar pacientes", error);
      }
    };
    buscarPacientes();
  }, []);

  // 2. BUSCAR DADOS GLOBAIS QUANDO O PACIENTE MUDA
  useEffect(() => {
    if (!pacienteAtivo) return;

    const buscarGlobais = async () => {
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;

        const res = await fetch(`${getApiUrl()}/estatisticas/${pacienteAtivo.id || pacienteAtivo._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setEstatisticasGlobais(data);
          setPlanetaAtivo(planetasBase[0]); // Seleciona o Netuno por padrão
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas globais", error);
      }
    };

    buscarGlobais();
  }, [pacienteAtivo]);

  // 3. BUSCAR DADOS ESPECÍFICOS DO PLANETA SELECIONADO
  useEffect(() => {
    if (!pacienteAtivo || !planetaAtivo) return;

    const buscarPlaneta = async () => {
      setIsLoading(true);
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;

        const idReal = pacienteAtivo.id || pacienteAtivo._id;
        const res = await fetch(`${getApiUrl()}/estatisticas/${idReal}?planetId=${planetaAtivo.id}`, {
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
  }, [planetaAtivo, pacienteAtivo]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  // Função nativa do navegador para gerar PDF (Abre a tela de impressão salva-como-pdf)
  const handleGerarPDF = () => {
    window.print();
  };

  if (pacientes.length === 0 && !isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-screen text-slate-400">
        Nenhum paciente vinculado à sua conta ainda.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-5 bg-transparent font-sans text-slate-600 overflow-hidden">
      
      {/* CABEÇALHO (Escondido na hora da impressão) */}
      <div className="mb-6 text-center print:hidden">
        <div className="fixed top-0 left-0 md:left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Análise Clínica
        </h2>
        <p className="text-slate-400 text-xs font-medium">Acompanhe a evolução cognitiva do seu paciente em tempo real</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        
        {/* COLUNA ESQUERDA: PACIENTE E PLANETAS (Escondido na impressão) */}
        <div className="w-full max-w-[260px] md:w-[260px] flex flex-col gap-4 shrink-0 print:hidden">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm flex items-center gap-3 hover:border-[#4A59BD]/40 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-md border border-slate-200 group-hover:scale-105 transition-transform">
                 <img src={`/jogadores/foto${estatisticasGlobais?.foto_perfil || 1}.png`} alt="Avatar" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-[10px] font-bold text-[#4A59BD] uppercase tracking-wider mb-0.5 opacity-70">Paciente</p>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-slate-700 truncate">{pacienteAtivo?.nome || pacienteAtivo?.apelido || "Carregando..."}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-slate-400 text-[9px] font-mono leading-none tracking-widest">CÓD: {pacienteAtivo?.codigo_vinculo || '----'}</p>
              </div>
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {pacientes.map((p) => (
                    <li key={p.id || p._id}>
                      <button
                        onClick={() => {
                          setPacienteAtivo(p);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${(pacienteAtivo?.id || pacienteAtivo?._id) === (p.id || p._id) ? 'text-[#4A59BD] font-bold bg-blue-50/50' : 'text-slate-600 font-medium'}`}
                      >
                        {p.nome || p.apelido}
                        {(pacienteAtivo?.id || pacienteAtivo?._id) === (p.id || p._id) && <div className="w-1.5 h-1.5 rounded-full bg-[#4A59BD]" />}
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
                    className={`flex flex-col items-center gap-1.5 transition-all ${isBloqueado ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                  >
                    <div className={`w-10 h-10 rounded-full ${p.cor} flex items-center justify-center relative shadow-inner`}>
                      {isBloqueado && <Lock className="w-3.5 h-3.5 text-white" />}
                      {planetaAtivo?.id === p.id && !isBloqueado && (
                        <div className="absolute -inset-1.5 border-2 border-[#4A59BD] rounded-full opacity-30" />
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 truncate w-full text-center">{p.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: ESTATÍSTICAS (Esta parte será impressa no PDF) */}
        <div className="w-full md:min-w-[480px] bg-white border border-slate-100 p-6 md:p-8 rounded-[2.5rem] shadow-sm self-stretch flex flex-col print:shadow-none print:border-none print:p-0">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-slate-300 animate-pulse">
                Calculando métricas cognitivas...
             </div>
          ) : estatisticasPlaneta && planetaAtivo ? (
            <div className="flex flex-col animate-in fade-in duration-500 h-full">
              
              {/* CABEÇALHO DO CARD / PDF */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-50 print:border-slate-300">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl ${planetaAtivo.cor} shadow-sm flex items-center justify-center print:border print:border-slate-300`} />
                  <div>
                    {/* Título visível apenas na impressão para contextualizar o PDF */}
                    <h1 className="hidden print:block text-2xl font-black text-slate-800 mb-1">
                      Relatório Cognitivo - {pacienteAtivo?.nome || pacienteAtivo?.apelido}
                    </h1>
                    
                    <h2 className="text-2xl font-semibold text-slate-700 leading-none">Análise - {planetaAtivo.nome}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100 print:bg-white print:border-slate-400">
                        {estatisticasPlaneta.total_partidas} Partidas Jogadas
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 print:bg-white print:border-slate-400">
                        Top Score: {estatisticasPlaneta.pontuacao_maxima} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÃO GERAR PDF (Escondido na hora que imprime) */}
                <button 
                  onClick={handleGerarPDF}
                  className="print:hidden flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-[#4078A4] border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Gerar relatório em PDF"
                >
                  <FileText className="w-4 h-4" />
                  Gerar PDF
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-10 gap-y-6 my-auto print:mt-10">
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

              {/* RODAPÉ DO PDF (Visível apenas na impressão) */}
              <div className="hidden print:block mt-16 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-4">
                Documento gerado automaticamente via Plataforma Cosmic Mind. <br />
                Data de emissão: {new Date().toLocaleDateString('pt-BR')}
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