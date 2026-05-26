'use client';

import { useState, useEffect } from 'react';
import { Lock, ChevronDown, Download } from 'lucide-react';
import { getApiUrl } from '@/utils/api';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface Planeta {
  id: string; 
  nome: string;
  desafio: string;
  cor: string;
  imagem: string; // Adicionado para suportar as imagens
}

export default function PerfomanceS() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteAtivo, setPacienteAtivo] = useState<any>(null);
  
  const [estatisticasGlobais, setEstatisticasGlobais] = useState<any>(null);
  const [estatisticasPlaneta, setEstatisticasPlaneta] = useState<any>(null);
  
  const [planetaAtivo, setPlanetaAtivo] = useState<Planeta | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Lista atualizada com os arquivos .png
  const planetasBase: Planeta[] = [
    { id: '57b6d77617cbdc1499b06cab3d9f650e', nome: 'Netuno', desafio: 'Resgate Crítico', cor: 'bg-[#4A59BD]', imagem: 'netuno.png' },
    { id: 'urano', nome: 'Urano', desafio: 'Órbita Complexa', cor: 'bg-[#38BDF8]', imagem: 'urano.png' },
    { id: 'saturno', nome: 'Saturno', desafio: 'Anéis de Poeira', cor: 'bg-[#C5A059]', imagem: 'saturno.png' },
    { id: 'jupiter', nome: 'Júpiter', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'jupiter.png' },
    { id: 'marte', nome: 'Marte', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'marte.png' },
    { id: 'terra', nome: 'Terra', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'terra.png' },
    { id: 'venus', nome: 'Vênus', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'venus.png' },
    { id: 'mercurio', nome: 'Mercúrio', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'mercurio.png' },
    { id: 'sol', nome: 'Pentas', desafio: '---', cor: 'bg-[#A3A3A3]', imagem: 'pentas.png' },
  ];

  useEffect(() => {
    const buscarPacientes = async () => {
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;
        if (!token) return;

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
          setPlanetaAtivo(planetasBase[0]); 
        }
      } catch (error) {
        console.error("Erro", error);
      }
    };
    buscarGlobais();
  }, [pacienteAtivo]);

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
        console.error("Erro", error);
      } finally {
        setIsLoading(false);
      }
    };
    buscarPlaneta();
  }, [planetaAtivo, pacienteAtivo]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  const handleBaixarPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const paginas = document.querySelectorAll('.pdf-page');
      
      if (paginas.length === 0) {
        throw new Error("Nenhuma página encontrada para o PDF.");
      }
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < paginas.length; i++) {
        const pagina = paginas[i] as HTMLElement;
        
        const canvas = await html2canvas(pagina, { 
          scale: 3, 
          useCORS: true, 
          backgroundColor: '#ffffff' 
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`Relatorio_${pacienteAtivo?.nome || pacienteAtivo?.apelido}.pdf`);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o documento PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (pacientes.length === 0 && !isLoading) {
    return <div className="w-full flex items-center justify-center h-screen text-slate-400">Nenhum paciente vinculado à sua conta ainda.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-5 bg-transparent font-sans text-slate-600 overflow-hidden">
      
      {/* ================= CABEÇALHO GLOBAL DA TELA ================= */}
      <div className="fixed top-0 left-0 md:left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
      
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
            Análise Clínica
          </h2>
          <p className="text-slate-400 text-xs font-medium">Acompanhe a evolução cognitiva do seu paciente em tempo real</p>
        </div>

        {/* BOTÃO DE BAIXAR PDF */}
        <button 
          onClick={handleBaixarPDF}
          disabled={!estatisticasPlaneta || isGeneratingPDF}
          className="flex items-center gap-2 bg-gradient-to-r from-[#4078A4] to-[#3E89AE] hover:brightness-110 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGeneratingPDF ? (
            <span className="animate-pulse flex items-center gap-2">Processando PDF...</span>
          ) : (
            <><Download className="w-4 h-4" /> Baixar Relatório PDF</>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        
        {/* COLUNA ESQUERDA: PACIENTE E PLANETAS */}
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
                    className={`flex flex-col items-center gap-1.5 transition-all ${isBloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                  >
                    {/* Container da imagem com overlay integrado */}
                    <div className="relative w-10 h-10">
                      <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner">
                        <img 
                          src={`/game/${p.imagem}`} 
                          alt={p.nome} 
                          className="w-full h-full object-cover"
                        />
                        {isBloqueado && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-white/90" />
                          </div>
                        )}
                      </div>

                      {/* Borda de seleção */}
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

        {/* COLUNA DIREITA: ESTATÍSTICAS DA TELA */}
        <div className="w-full md:min-w-[480px] bg-white border border-slate-100 p-6 md:p-8 rounded-[2.5rem] shadow-sm self-stretch flex flex-col">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-slate-300 animate-pulse">
               Calculando métricas cognitivas...
             </div>
          ) : estatisticasPlaneta && planetaAtivo ? (
            <div className="flex flex-col animate-in fade-in duration-500 h-full">
              
              <div className="flex items-center gap-5 mb-6 pb-4 border-b border-slate-50">
                {/* Avatar do planeta substituindo a cor chapada */}
                <div className="w-12 h-12 rounded-2xl shadow-sm overflow-hidden flex items-center justify-center bg-slate-100 shrink-0">
                  <img 
                    src={`/game/${planetaAtivo.imagem}`} 
                    alt={planetaAtivo.nome} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-slate-700 leading-none">Análise - {planetaAtivo.nome}</h2>
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

      {/* ========================================================================================= */}
      {/* TEMPLATE DO PDF (Isolado e separado por páginas) */}
      {/* ========================================================================================= */}
      {estatisticasPlaneta && planetaAtivo && pacienteAtivo && (
        <div className="absolute left-[-9999px] top-[-9999px]">
          <div id="relatorio-pdf-container">
            
            {/* ---------------- PÁGINA 1: CAPA ---------------- */}
            <div className="pdf-page w-[210mm] min-h-[297mm] p-12" style={{ backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}>
              <div className="flex flex-col items-center justify-center h-[260mm]" style={{ textAlign: 'center' }}>
                <img src="/icons/logo.png" alt="Cosmic Mind Logo" className="h-28 mb-8 object-contain" />
                
                <h1 className="font-black mb-3" style={{ color: '#1e293b', fontSize: '36px', lineHeight: '40px' }}>Relatório de Desempenho</h1>
                
                <p className="font-medium max-w-lg mx-auto mb-16 leading-relaxed" style={{ color: '#64748b', fontSize: '14px', lineHeight: '20px' }}>
                  Painel web de monitoramento cognitivo para crianças com TDAH. Análise médica de desempenho baseada em métricas coletadas pela Equipe Spectrum.
                </p>

                <div className="rounded-3xl p-10 w-full max-w-sm mx-auto" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="font-black uppercase tracking-widest mb-2" style={{ color: '#94a3b8', fontSize: '10px' }}>Paciente</p>
                  <p className="font-black mb-4" style={{ color: '#4A59BD', fontSize: '30px', lineHeight: '36px' }}>{pacienteAtivo.nome || pacienteAtivo.apelido}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <span className="font-bold uppercase tracking-widest" style={{ color: '#94a3b8', fontSize: '10px' }}>CÓD:</span>
                    <span className="font-mono font-bold tracking-widest" style={{ color: '#334155', fontSize: '14px', lineHeight: '20px' }}>{pacienteAtivo.codigo_vinculo || '----'}</span>
                  </div>
                </div>

                <div className="mt-32 pt-8 w-full max-w-md mx-auto" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <p className="font-medium uppercase tracking-widest" style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '16px' }}>
                    Gerado em {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* ---------------- PÁGINA 2: DADOS DO PLANETA ---------------- */}
            <div className="pdf-page w-[210mm] min-h-[297mm] p-12" style={{ backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}>
              <div className="pt-8 h-[260mm]">
                
                <div className="flex justify-between items-end pb-4 mb-10" style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 className="font-black" style={{ color: '#1e293b', fontSize: '24px', lineHeight: '32px' }}>Desempenho da Fase</h2>
                    <p className="font-bold uppercase tracking-widest mt-1" style={{ color: '#4A59BD', fontSize: '14px', lineHeight: '20px' }}>{planetaAtivo.nome} - {planetaAtivo.desafio}</p>
                  </div>
                </div>

                {/* DADOS GERAIS (NÚMEROS) */}
                <h3 className="font-black uppercase tracking-widest mb-4 pb-2" style={{ color: '#4A59BD', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>Métricas Gerais da Partida</h3>
                <div className="grid grid-cols-4 gap-4 mb-12" style={{ textAlign: 'center' }}>
                  <div className="p-5 rounded-2xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="font-bold uppercase mb-2" style={{ color: '#64748b', fontSize: '10px' }}>Partidas</p>
                    <p className="font-black" style={{ color: '#1e293b', fontSize: '30px', lineHeight: '36px' }}>{estatisticasPlaneta.total_partidas}</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="font-bold uppercase mb-2" style={{ color: '#64748b', fontSize: '10px' }}>Top Score</p>
                    <p className="font-black" style={{ color: '#4A59BD', fontSize: '30px', lineHeight: '36px' }}>{estatisticasPlaneta.pontuacao_maxima}</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="font-bold uppercase mb-2" style={{ color: '#64748b', fontSize: '10px' }}>Acertos</p>
                    <p className="font-black" style={{ color: '#059669', fontSize: '30px', lineHeight: '36px' }}>{estatisticasPlaneta.total_acertos}</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="font-bold uppercase mb-2" style={{ color: '#64748b', fontSize: '10px' }}>Tempo de Reação</p>
                    <p className="font-black mt-1" style={{ color: '#1e293b', fontSize: '24px', lineHeight: '32px' }}>{estatisticasPlaneta.media_tempo_reacao_ms}<span className="font-medium ml-1" style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '16px' }}>ms</span></p>
                  </div>
                </div>

                {/* ÍNDICES COGNITIVOS (BARRAS HORIZONTAIS) */}
                <h3 className="font-black uppercase tracking-widest mb-6 pb-2" style={{ color: '#4A59BD', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>Evolução Cognitiva Específica</h3>
                <div className="space-y-6 mb-12 px-2">
                  {Object.entries(estatisticasPlaneta.habilidades).map(([key, value]) => {
                    const val = Number(value) || 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-bold" style={{ color: '#475569', fontSize: '14px', lineHeight: '20px' }}>{key}</span>
                          <span className="font-black" style={{ color: '#4A59BD', fontSize: '14px', lineHeight: '20px' }}>{val}%</span>
                        </div>
                        <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                          <div className="h-full rounded-full" style={{ backgroundColor: '#4A59BD', width: `${val}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RODAPÉ */}
                <div className="mt-20 pt-6" style={{ borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <p className="font-black uppercase tracking-widest mb-2" style={{ color: '#94a3b8', fontSize: '9px' }}>Confidencial - Uso Clínico Exclusivo</p>
                  <p className="leading-relaxed max-w-2xl mx-auto" style={{ color: '#64748b', fontSize: '10px' }}>
                    As métricas contidas neste relatório foram extraídas da plataforma Cosmic Mind e refletem a interação direta do paciente. Este documento não substitui diagnóstico médico.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}