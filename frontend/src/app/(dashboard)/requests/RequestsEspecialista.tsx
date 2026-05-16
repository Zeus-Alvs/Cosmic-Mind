'use client';

import { useState } from 'react';
import { X, ShieldAlert, MoreVertical, Trash2, Search, Send } from 'lucide-react';

interface Paciente {
  id: string;
  nome: string;
  foto: string;
}

interface Solicitacao {
  id: string;
  paciente: string;
  fotoPaciente: string;
  status: 'enviada' | 'aceita';
  dataEnvio: string;
}


const pacientesDB: Paciente[] = [
  { id: "123", nome: "Ana Silva", foto: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ana" },
  { id: "456", nome: "Davi Souza", foto: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Davi" },
];

export default function RequestsS() {
  const [buscaId, setBuscaId] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([
    { id: "1", paciente: "Marcos Oliveira", fotoPaciente: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Marcos", status: 'enviada', dataEnvio: '02/05/2026' },
    { id: "2", paciente: "Julia Costa", fotoPaciente: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Julia", status: 'aceita', dataEnvio: '01/05/2026' }
  ]);
  const [modalExcluir, setModalExcluir] = useState<Solicitacao | null>(null);

  const handleBuscar = () => {
    const encontrado = pacientesDB.find(p => p.id === buscaId);
    setPacienteEncontrado(encontrado || null);
    if (!encontrado && buscaId !== '') alert("Paciente não encontrado.");
  };

  const enviarSolicitacao = () => {
    if (pacienteEncontrado) {
      const nova: Solicitacao = {
        id: Math.random().toString(),
        paciente: pacienteEncontrado.nome,
        fotoPaciente: pacienteEncontrado.foto,
        status: 'enviada',
        dataEnvio: new Date().toLocaleDateString()
      };
      setSolicitacoes([nova, ...solicitacoes]);
      setPacienteEncontrado(null);
      setBuscaId('');
    }
  };

  const handleRemover = (id: string) => {
    setSolicitacoes(prev => prev.filter(s => s.id !== id));
    setModalExcluir(null);
  };

  const enviadas = solicitacoes.filter(s => s.status === 'enviada');
  const aceitas = solicitacoes.filter(s => s.status === 'aceita');

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />


      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] bg-clip-text text-transparent">
          Gerenciar Vínculos
        </h2>

        <div className="relative flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4078A4] transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar ID do Jogador..."
              value={buscaId}
              onChange={(e) => setBuscaId(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4078A4]/20 focus:border-[#4078A4] transition-all w-64"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="bg-[#4078A4] text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-[#3E89AE] transition-all shadow-lg shadow-blue-100"
          >
            Buscar
          </button>
        </div>
      </div>


      {pacienteEncontrado && (
        <div className="mb-12 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-[#AC57EB]/10 to-[#4078A4]/10 border border-[#4078A4]/20 p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={pacienteEncontrado.foto} className="w-12 h-12 rounded-xl bg-white p-1 border border-white shadow-sm" alt="" />
              <div>
                <p className="text-[10px] font-black text-[#AC57EB] uppercase tracking-widest">Jogador Encontrado</p>
                <h3 className="font-bold text-slate-700">{pacienteEncontrado.nome}</h3>
              </div>
            </div>
            <button
              onClick={enviarSolicitacao}
              className="flex items-center gap-2 bg-white text-[#4078A4] px-6 py-3 rounded-2xl text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95 border border-white"
            >
              <Send className="w-4 h-4" /> ENVIAR SOLICITAÇÃO
            </button>
          </div>
        </div>
      )}


      <section className="mb-12">
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] bg-clip-text text-transparent">
            Solicitações Enviadas
          </h3>
        </div>

        {enviadas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enviadas.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.fotoPaciente} className="w-10 h-10 rounded-xl bg-slate-50 p-1" alt="" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.paciente}</p>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Pendente
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setModalExcluir(item)} className="p-1.5 hover:bg-red-50 rounded-full text-slate-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold px-2">
                  Enviada em: {item.dataEnvio}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-3xl p-10 border border-dashed border-slate-200 text-center italic text-slate-400 text-sm">
            Nenhuma solicitação enviada no momento.
          </div>
        )}
      </section>


      <section>
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] bg-clip-text text-transparent">
            Permissões Aceitas
          </h3>
        </div>

        {aceitas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aceitas.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3 group relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.fotoPaciente} className="w-10 h-10 rounded-xl bg-slate-50 p-1 border border-slate-100" alt="" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.paciente}</p>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider italic">Conectado</p>
                    </div>
                  </div>
                  <button onClick={() => setModalExcluir(item)} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-300 hover:text-red-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <button className="flex items-center justify-center gap-2 bg-[#4078A4]/5 hover:bg-[#4078A4]/10 p-2 rounded-xl border border-[#4078A4]/10 text-[10px] font-black text-[#4078A4] transition-all">
                  VER RELATÓRIOS
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center italic text-slate-400 text-xs">
            <ShieldAlert className="w-6 h-6 mb-2 opacity-20" /> Sem acessos ativos.
          </div>
        )}
      </section>


      {modalExcluir && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 p-7">
            <div className="text-center mb-6">
              <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Ação Irreversível</p>
              <h4 className="text-slate-700 font-black text-xl italic">
                {modalExcluir.status === 'enviada' ? 'Cancelar Convite?' : 'Encerrar Vínculo?'}
              </h4>
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <img src={modalExcluir.fotoPaciente} className="w-20 h-20 rounded-2xl bg-slate-50 p-2 border-2 border-slate-100 opacity-50" alt="" />
                <X className="absolute inset-0 m-auto text-red-500 w-10 h-10" />
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 mb-8 font-medium leading-relaxed px-2">
              Você deixará de ter acesso aos dados de <span className="font-bold text-slate-600">{modalExcluir.paciente}</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleRemover(modalExcluir.id)}
                className="flex-1 bg-red-500 text-white py-3.5 rounded-2xl shadow-lg shadow-red-100 flex justify-center hover:bg-red-600 transition-all active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setModalExcluir(null)}
                className="flex-1 bg-slate-100 text-slate-400 py-3.5 rounded-2xl flex justify-center hover:bg-slate-200 transition-all active:scale-95"
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