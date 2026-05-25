'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, ShieldCheck, UserPlus, X, Trash2, Users } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface PacienteBusca {
  codigo_vinculo: string;
  nome: string;
  foto: number;
}

interface SolicitacaoEspecialista {
  id_solicitacao: string;
  paciente: string;
  fotoPaciente: string;
  codigo_vinculo: string;
  status: 'pendente' | 'aprovado';
}

export default function RequestsS() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEspecialista[]>([]);
  const [buscaCodigo, setBuscaCodigo] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState<PacienteBusca | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [modalExcluir, setModalExcluir] = useState<SolicitacaoEspecialista | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;
        if (!token) return;

        const res = await fetch(`${getApiUrl()}/vinculo/meus-vinculos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();

          const formatado = data.map((s: any) => ({
            id_solicitacao: s.id_solicitacao,
            paciente: s.nome_jogador,
            fotoPaciente: `/jogadores/foto${s.foto_jogador || 1}.png`,
            codigo_vinculo: s.codigo_vinculo,
            status: s.status
          }));

          setSolicitacoes(formatado);
        }
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buscaCodigo.trim()) return;

    setIsSearching(true);
    setResultadoBusca(null);

    try {
      const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
      const token = dadosSalvos.token_acesso;

      const res = await fetch(`${getApiUrl()}/jogadores/buscar/${buscaCodigo.trim().toUpperCase()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setResultadoBusca({
          codigo_vinculo: data.codigo_vinculo,
          nome: data.apelido,
          foto: data.foto_perfil
        });
      } else {
        alert("Paciente não encontrado com este código.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar paciente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSolicitar = async () => {
    if (!resultadoBusca) return;

    try {
      const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
      const token = dadosSalvos.token_acesso;

      const res = await fetch(`${getApiUrl()}/vinculo/solicitar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo_vinculo: resultadoBusca.codigo_vinculo })
      });

      if (res.ok) {
        alert("Solicitação enviada com sucesso!");
        setResultadoBusca(null);
        setBuscaCodigo('');

        window.location.reload(); 
      } else {
        const err = await res.json();
        alert(`Erro: ${err.detail}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemover = async (id_solicitacao: string) => {
    try {
      const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
      const token = dadosSalvos.token_acesso;

      const res = await fetch(`${getApiUrl()}/vinculo/cancelar/${id_solicitacao}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setSolicitacoes(prev => prev.filter(s => s.id_solicitacao !== id_solicitacao));
        setModalExcluir(null);
      } else {
        alert("Erro ao remover vínculo.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pendentes = solicitacoes.filter(s => s.status === 'pendente');
  const aprovadas = solicitacoes.filter(s => s.status === 'aprovado');

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Carregando vínculos...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent">
          Gerenciar Pacientes
        </h2>
        <p className="text-slate-400 text-sm mt-1">Busque novos pacientes e acompanhe suas solicitações.</p>
      </div>

      <section className="mb-12 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#4078A4]" /> Novo Vínculo
        </h3>

        <form onSubmit={handleBuscar} className="flex gap-3 mb-6">
          <input
            type="text"
            value={buscaCodigo}
            onChange={(e) => setBuscaCodigo(e.target.value.toUpperCase())}
            placeholder="Digite o código de 6 dígitos (Ex: A9X4BT)"
            maxLength={6}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all tracking-widest font-mono font-bold text-slate-700 uppercase"
          />
          <button 
            type="submit"
            disabled={isSearching || buscaCodigo.length < 6}
            className="bg-[#4078A4] hover:bg-[#3E89AE] text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? 'Buscando...' : 'Pesquisar'}
          </button>
        </form>

        {resultadoBusca && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={`/jogadores/foto${resultadoBusca.foto || 1}.png`} className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm p-1" alt="" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Paciente Encontrado</p>
                  <h4 className="text-lg font-black text-[#4078A4]">{resultadoBusca.nome}</h4>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setResultadoBusca(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSolicitar}
                  className="bg-gradient-to-r from-[#AC57EB] to-[#9D70D6] hover:brightness-110 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Enviar Solicitação
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mb-12">
        <h3 className="text-lg font-bold tracking-tight text-slate-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> Aguardando Aprovação do Responsável
        </h3>

        {pendentes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendentes.map((item) => (
              <div key={item.id_solicitacao} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                <div className="flex items-center justify-between mb-3 pl-2">
                  <div className="flex items-center gap-3">
                    <img src={item.fotoPaciente} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1" alt="" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 truncate">{item.paciente}</h3>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Pendente</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pl-2 pt-3 border-t border-slate-50">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    Cód: {item.codigo_vinculo}
                  </span>
                  <button
                    onClick={() => handleRemover(item.id_solicitacao)}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3 stroke-[3]" /> CANCELAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center italic text-slate-400">
            <p className="text-sm">Nenhuma solicitação pendente no momento.</p>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold tracking-tight text-slate-700 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> Pacientes Vinculados
        </h3>

        {aprovadas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aprovadas.map((item) => (
              <div key={item.id_solicitacao} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center gap-3">
                    <img src={item.fotoPaciente} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1" alt="" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.paciente}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Acesso Liberado</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalExcluir(item)}
                    className="p-1.5 hover:bg-red-50 rounded-full text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remover paciente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center italic text-slate-400 text-xs">
            <Users className="w-6 h-6 mb-2 opacity-20" /> Você ainda não possui pacientes vinculados.
          </div>
        )}
      </section>

      {modalExcluir && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 p-7">
            <div className="text-center mb-6">
              <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Remover Paciente</p>
              <h4 className="text-slate-700 font-black text-xl italic">Encerrar Vínculo?</h4>
            </div>

            <div className="flex items-center justify-center mb-8">
              <img src={modalExcluir.fotoPaciente} className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-red-100 p-1" alt="" />
            </div>

            <p className="text-center text-[11px] text-slate-500 mb-8 font-medium leading-relaxed px-2">
              Você não terá mais acesso aos dados de desempenho de <span className="font-bold text-slate-700">{modalExcluir.paciente}</span>.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => handleRemover(modalExcluir.id_solicitacao)} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl shadow-lg shadow-red-100 flex justify-center transition-transform active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setModalExcluir(null)} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-400 py-3.5 rounded-2xl flex justify-center transition-transform active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}