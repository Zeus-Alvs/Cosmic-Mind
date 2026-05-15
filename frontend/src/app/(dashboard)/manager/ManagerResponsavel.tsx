'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Gamepad2 } from 'lucide-react';

interface PlayerPerformanceDTO {
id: string;
nome: string;
progresso: number;
tempoUso: string;
nivelFase: string;
pontuacao: number;
}

export default function ManagerS() {
const [currentIndex, setCurrentIndex] = useState(0);
const [players, setPlayers] = useState<PlayerPerformanceDTO[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Estados do Modal
const [isModalOpen, setIsModalOpen] = useState(false);
const [newPlayerName, setNewPlayerName] = useState('');
const [generatedPin, setGeneratedPin] = useState<string | null>(null);
const [isCreating, setIsCreating] = useState(false);

useEffect(() => {
const loadPlayers = async () => {
try {
const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
if (!dadosSalvos.id) {
setIsLoading(false);
return;
}

    const response = await fetch('http://127.0.0.1:8000/api/jogadores/' + dadosSalvos.id);
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
loadPlayers();
}, []);

const handleCreateSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!newPlayerName.trim()) return;

setIsCreating(true);
const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');

try {
  const resCriar = await fetch('http://127.0.0.1:8000/api/jogadores/' + dadosSalvos.id, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apelido: newPlayerName, foto_perfil: 1 })
  });
  
  if (!resCriar.ok) throw new Error("Falha ao criar jogador");
  const dataCriar = await resCriar.json();

  const resPin = await fetch('http://127.0.0.1:8000/api/jogo/gerar-pin/' + dataCriar.id_jogador, {
    method: 'POST'
  });
  
  if (!resPin.ok) throw new Error("Falha ao gerar PIN");
  const dataPin = await resPin.json();

  setGeneratedPin(dataPin.pin);
  
} catch (error) {
  console.error("Erro no processo:", error);
  alert("Ocorreu um erro ao processar sua solicitação.");
} finally {
  setIsCreating(false);
}
};

const closeAndReload = () => {
setIsModalOpen(false);
window.location.reload();
};

// Lista fixa de jogadores + card de Adicionar
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
    {/* Setas de Navegação */}
    <button 
      onClick={prevSlide}
      className={`absolute left-0 lg:left-10 z-[100] p-2 transition-all ${currentIndex === 0 ? 'opacity-10 pointer-events-none' : 'hover:scale-110 text-slate-400'}`}
    >
      <ChevronLeft className="w-12 h-12 stroke-[1px]" />
    </button>

    {/* Pilha de Cards */}
    <div className="relative flex items-center justify-center w-full">
      {allCards.map((card, index) => {
        const isCenter = index === currentIndex;
        const isLeft = index === currentIndex - 1;
        const isRight = index === currentIndex + 1;
        const isVisible = isCenter || isLeft || isRight;

        return (
          <div 
            key={card.id}
            onClick={!("isAdd" in card) ? undefined : () => setIsModalOpen(true)}
            className={`
              absolute transition-all duration-500 ease-in-out rounded-[35px] shadow-lg
              ${isCenter ? 'z-50 scale-100 opacity-100 shadow-2xl translate-x-0' : ''}
              ${isLeft ? 'z-30 scale-[0.82] opacity-30 -translate-x-[240px] blur-[1px]' : ''}
              ${isRight ? 'z-30 scale-[0.82] opacity-30 translate-x-[240px] blur-[1px]' : ''}
              ${!isVisible ? 'opacity-0 scale-50 z-0 pointer-events-none' : ''}
              ${!("isAdd" in card) ? 'bg-[#F2ECEF] border border-white' : 'bg-white border-2 border-dashed border-slate-200'}
            `}
            style={{ width: '340px', height: '260px' }}
          >
            {!("isAdd" in card) ? (
              /* Layout do Jogador */
              <div className="p-8 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#3E89AE] border-2 border-white shadow-sm flex items-center justify-center text-white text-2xl font-bold">
                      {card.nome.charAt(0)}
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
                        cx="32" cy="32" r="26" stroke="#4078A4" strokeWidth="6" fill="transparent" 
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
                  <p className="text-[11px] text-slate-600"><span className="font-black mr-2">Pontos:</span>{card.pontuacao} pontos</p>
                </div>

                <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#69A1C9] to-[#9D70D6] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all">
                  Acessar
                </button>
              </div>
            ) : (
              /* Layout do Card Adicionar (Mesmo tamanho e estilo da pilha) */
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
      className={`absolute right-0 lg:right-10 z-[100] p-2 transition-all ${currentIndex === allCards.length - 1 ? 'opacity-10 pointer-events-none' : 'hover:scale-110 text-slate-400'}`}
    >
      <ChevronRight className="w-12 h-12 stroke-[1px]" />
    </button>
  </div>

  {/* Indicadores Visuais */}
  <div className="flex gap-2 mt-8">
    {allCards.map((_, i) => (
      <div 
        key={i} 
        className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-10 bg-[#9D70D6]' : 'w-2 bg-slate-200'}`} 
      />
    ))}
  </div>

  {/* MODAL DE ADICIONAR JOGADOR */}
  {isModalOpen && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[30px] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Botão Fechar */}
        {!generatedPin && (
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!generatedPin ? (
          /* ESTADO 1: FORMULÁRIO DE CRIAÇÃO */
          <form onSubmit={handleCreateSubmit}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-[#AC57EB]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Novo Jogador</h3>
              <p className="text-sm text-slate-500 mt-1">Crie um perfil para gerar o código de acesso ao aplicativo.</p>
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
              
              <button 
                type="submit" 
                disabled={isCreating || !newPlayerName.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4078A4] to-[#AC57EB] text-white font-bold text-sm shadow-md hover:brightness-110 transition-all disabled:opacity-50 mt-4"
              >
                {isCreating ? 'Gerando Código...' : 'Criar Perfil e Gerar PIN'}
              </button>
            </div>
          </form>
        ) : (
          /* ESTADO 2: SUCESSO E EXIBIÇÃO DO PIN */
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Pronto para jogar!</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">Insira o código abaixo no aplicativo do celular para conectar a conta de <strong>{newPlayerName}</strong>.</p>
            
            <div className="bg-slate-100 rounded-2xl py-6 mb-8 border border-slate-200">
              <p className="text-4xl font-black tracking-[0.25em] text-slate-800">{generatedPin}</p>
            </div>

            <p className="text-xs font-bold text-red-500 mb-6">ESTE CÓDIGO EXPIRA EM 10 MINUTOS</p>

            <button 
              onClick={closeAndReload}
              className="w-full py-3.5 rounded-xl bg-slate-800 text-white font-bold text-sm shadow-md hover:bg-slate-700 transition-colors"
            >
              Concluir e Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )}
    </div>
  );
}