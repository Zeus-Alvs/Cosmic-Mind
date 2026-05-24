'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, X, Gamepad2, Smartphone } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface PlayerPerformanceDTO {
  id: string;
  nome: string;
  progresso: number;
  tempoUso: string;
  nivelFase: string;
  pontuacao: number;
  foto_perfil?: number;
}

export default function ManagerS() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [players, setPlayers] = useState<PlayerPerformanceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectPlayerName, setConnectPlayerName] = useState('');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);

  const loadPlayers = async () => {
    try {
      const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
      if (!dadosSalvos.id) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${getApiUrl()}/jogadores/` + dadosSalvos.id);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPlayerName.trim() && !birthDate) {
      setErrorMsg("Preencha todos os campos.");
      return;
    }
    if (!newPlayerName.trim()) {
      setErrorMsg("Preencha o nome ou apelido.");
      return;
    }
    if (!birthDate) {
      setErrorMsg("Preencha a data de nascimento.");
      return;
    }

    setIsCreating(true);
    const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');

    try {
      const resCriar = await fetch(`${getApiUrl()}/jogadores/` + dadosSalvos.id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apelido: newPlayerName, foto_perfil: 1, data_nascimento: birthDate })
      });

      if (!resCriar.ok) throw new Error("Falha ao criar jogador");

      setIsModalOpen(false);
      setNewPlayerName('');
      setBirthDate('');
      setErrorMsg('');
      await loadPlayers();

    } catch (error) {
      console.error("Erro no processo:", error);
      alert("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConectar = async (jogadorId: string, jogadorNome: string) => {
    setConnectPlayerName(jogadorNome);
    setGeneratedPin(null);
    setIsConnectModalOpen(true);
    setIsGeneratingPin(true);

    try {
      const resPin = await fetch(`${getApiUrl()}/jogo/gerar-pin/` + jogadorId, {
        method: 'POST'
      });

      if (!resPin.ok) throw new Error("Falha ao gerar PIN");
      const dataPin = await resPin.json();
      setGeneratedPin(dataPin.pin);
      localStorage.setItem('token_acesso', dataPin.token_acesso);
    } catch (error) {
      console.error("Erro ao gerar PIN:", error);
      alert("Erro ao gerar o código de conexão.");
      setIsConnectModalOpen(false);
    } finally {
      setIsGeneratingPin(false);
    }
  };

  const allCards = [...players, { id: 'add-card', isAdd: true }];

  const nextSlide = () => {
    if (currentIndex < allCards.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (isLoading) return <div className="text-center p-10 text-slate-400 font-bold">Carregando...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center">
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">Desempenho do Jogador</h2>
        <p className="text-slate-400 text-xs mt-1">Selecione um jogador para acompanhar o seu progresso</p>
      </div>

      <div className="relative w-full flex items-center justify-center h-[350px]">
        <button
          onClick={prevSlide}
          className={`absolute left-0 lg:left-10 z-[100] p-2 transition-all cursor-pointer ${currentIndex === 0 ? 'opacity-10 pointer-events-none' : 'hover:scale-110 text-slate-400'}`}
        >
          <ChevronLeft className="w-12 h-12 stroke-[1px]" />
        </button>

        <div className="relative flex items-center justify-center w-full">
          {allCards.map((card, index) => {
            const isCenter = index === currentIndex;
            const isLeft = index === currentIndex - 1;
            const isRight = index === currentIndex + 1;
            const isVisible = isCenter || isLeft || isRight;
            const isAddCard = "isAdd" in card;

            return (
              <div
                key={card.id}
                onClick={isAddCard ? () => setIsModalOpen(true) : undefined}
                className={`
                  absolute transition-all duration-500 ease-in-out rounded-[35px] shadow-lg
                  ${isCenter ? 'z-50 scale-100 opacity-100 shadow-2xl translate-x-0' : ''}
                  ${isLeft ? 'z-30 scale-[0.82] opacity-30 -translate-x-[240px] blur-[1px]' : ''}
                  ${isRight ? 'z-30 scale-[0.82] opacity-30 translate-x-[240px] blur-[1px]' : ''}
                  ${!isVisible ? 'opacity-0 scale-50 z-0 pointer-events-none' : ''}
                  ${!isAddCard ? 'bg-[#F2ECEF] border border-white' : 'bg-white border-2 border-dashed border-slate-200 cursor-pointer'}
                `}
                style={{ width: '340px', height: '260px' }}
              >
                {!isAddCard ? (
                  <div className="p-8 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
                          <img src={`/jogadores/foto${card.foto_perfil || 1}.png`} alt={card.nome} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="text-md font-bold text-slate-800 leading-tight">{card.nome}</h3>
                          <p className="text-[10px] text-slate-400 font-bold">ID: 0001</p>
                        </div>
                      </div>

                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="#D1D5DB" strokeWidth="6" fill="transparent" />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#4078A4"
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
                      <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Tempo:</span>{card.tempoUso}</p>
                      <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Fase:</span>{card.nivelFase}</p>
                      <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Points:</span>{card.pontuacao} pontos</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/edit?id=${card.id}`); }}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#69A1C9] to-[#9D70D6] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleConectar(card.id, card.nome); }}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#3E89AE] to-[#4078A4] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Conectar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Plus className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 mb-1">Adicionar Perfil</h3>
                    <p className="text-[10px] text-slate-300 max-w-[150px]">Clique para cadastrar um novo jogador</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={nextSlide}
          className={`absolute right-0 lg:right-10 z-[100] p-2 transition-all cursor-pointer ${currentIndex === allCards.length - 1 ? 'opacity-10 pointer-events-none' : 'hover:scale-110 text-slate-400'}`}
        >
          <ChevronRight className="w-12 h-12 stroke-[1px]" />
        </button>
      </div>

      <div className="flex gap-2 mt-8">
        {allCards.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-10 bg-[#9D70D6]' : 'w-2 bg-slate-200'}`}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateSubmit}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-8 h-8 text-[#AC57EB]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Novo Jogador</h3>
                <p className="text-sm text-slate-500 mt-1">Crie um perfil para o jogador. Depois, use o botão "Conectar" para gerar o código de acesso.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">NOME OU APELIDO</label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Ex: Davi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700 mt-1"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">DATA DE NASCIMENTO</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700 mt-1"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-bold text-red-500 text-center mt-2">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4078A4] to-[#AC57EB] text-white font-bold text-sm shadow-md hover:brightness-110 transition-all disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {isCreating ? 'Criando...' : 'Criar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {generatedPin && (
              <button
                onClick={() => { setIsConnectModalOpen(false); setGeneratedPin(null); }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isGeneratingPin ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Smartphone className="w-8 h-8 text-[#4078A4]" />
                </div>
                <p className="text-slate-400 font-bold">Gerando código...</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Conectar ao Jogo</h3>
                <p className="text-sm text-slate-500 mt-2 mb-6">Insira este código no jogo para conectar a conta de <strong>{connectPlayerName}</strong>.</p>

                <div className="bg-slate-100 rounded-2xl py-6 mb-6 border border-slate-200">
                  <p className="text-4xl font-black tracking-[0.25em] text-slate-800">{generatedPin}</p>
                </div>

                <p className="text-xs text-slate-500 mb-2 leading-relaxed max-w-xs mx-auto">
                  Insira este código no jogo. Ele se tornará o <strong>passe de acesso</strong> da criança para as próximas <strong>2 horas</strong>.
                </p>
                <p className="text-xs font-bold text-red-500 mb-6">CÓDIGO VÁLIDO POR 10 MINUTOS PARA INSERÇÃO</p>

                <button
                  onClick={() => { setIsConnectModalOpen(false); setGeneratedPin(null); }}
                  className="w-full py-3.5 rounded-xl bg-slate-800 text-white font-bold text-sm shadow-md hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}