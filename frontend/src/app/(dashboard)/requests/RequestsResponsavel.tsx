'use client';

import { useState } from 'react';
import { Check, X, Building2, Inbox, ShieldAlert, MoreVertical, Trash2, Eye } from 'lucide-react';


interface Solicitacao {
  id: string;
  profissional: string;
  fotoProfissional: string;
  clinica: string;
  cargo: string;
  paciente: string;
  fotoPaciente: string;
  status: 'pendente' | 'aprovado';
  permissoes: string[];
}

const initialData: Solicitacao[] = [
  {
    id: "21342",
    profissional: "Regina Ribeiro",
    fotoProfissional: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150&h=150",
    clinica: "Clínica Mente Brilhante",
    cargo: "Psicopedagoga",
    paciente: "Ana Silva",
    fotoPaciente: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ana",
    status: "pendente",
    permissoes: ["Visualizar dados de desempenho", "Informações do perfil", "Insights de diagnósticos"]
  },
  {
    id: "21345",
    profissional: "Dr. Ricardo Lemos",
    fotoProfissional: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150",
    clinica: "Centro de Apoio Kids",
    cargo: "Psicólogo Infantil",
    paciente: "Davi Souza",
    fotoPaciente: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Davi",
    status: "aprovado",
    permissoes: ["Visualizar dados de desempenho", "Informações do perfil", "Insights de diagnósticos"]
  }
];

export default function RequestsR() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(initialData);
  const [modalConfira, setModalConfira] = useState<Solicitacao | null>(null);
  const [modalExcluir, setModalExcluir] = useState<Solicitacao | null>(null);

  const handleAprovar = (id: string) => {
    setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: 'aprovado' } : s));
    setModalConfira(null);
  };

  const handleRemover = (id: string) => {
    setSolicitacoes(prev => prev.filter(s => s.id !== id));
    setModalExcluir(null);
    setModalConfira(null);
  };

  const pendentes = solicitacoes.filter(s => s.status === 'pendente');
  const aprovadas = solicitacoes.filter(s => s.status === 'aprovado');

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />


      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] bg-clip-text text-transparent">
          Solicitações Recebidas
        </h2>
      </div>

      <section className="mb-12">
        {pendentes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendentes.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <img src={item.fotoProfissional} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{item.profissional}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{item.cargo}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src={item.fotoPaciente} className="w-7 h-7 rounded-lg bg-white p-0.5 border border-slate-200" alt="" />
                    <span className="text-xs font-bold text-slate-600">{item.paciente}</span>
                  </div>
                  <button
                    onClick={() => setModalConfira(item)}
                    className="text-[10px] font-black text-[#AC57EB] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#AC57EB] hover:text-white transition-all border border-purple-50"
                  >
                    CONFIRA
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center italic text-slate-400">
            <Inbox className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Nenhuma solicitação pendente.</p>
          </div>
        )}
      </section>


      <section>
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] bg-clip-text text-transparent">
            Acessos Permitidos
          </h3>
        </div>

        {aprovadas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aprovadas.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3 group relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.fotoProfissional} className="w-9 h-9 rounded-full object-cover border border-slate-200" alt="" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">{item.profissional}</p>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Ativo</p>
                    </div>
                  </div>


                  <button
                    onClick={() => setModalExcluir(item)}
                    className="p-1.5 hover:bg-slate-50 rounded-full text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-[#4078A4]/5 p-2 rounded-xl border border-[#4078A4]/10">
                  <img src={item.fotoPaciente} className="w-6 h-6 rounded-md bg-white border border-slate-100" alt="" />
                  <p className="text-[10px] font-bold text-[#4078A4]">Acompanhando: {item.paciente}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center italic text-slate-400 text-xs">
            <ShieldAlert className="w-6 h-6 mb-2 opacity-20" /> Sem acessos permitidos
          </div>
        )}
      </section>


      {modalConfira && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 p-7">
            <div className="text-center mb-6">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Novo Vínculo</p>
              <h4 className="text-[#4078A4] font-black text-xl italic">Aprovar Acesso?</h4>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <img src={modalConfira.fotoProfissional} className="w-14 h-14 rounded-full object-cover ring-4 ring-purple-50" alt="" />
              <div className="h-px w-8 bg-slate-200" />
              <img src={modalConfira.fotoPaciente} className="w-14 h-14 rounded-xl bg-slate-50 border-2 border-white shadow-md p-1" alt="" />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Permissões solicitadas:
              </p>
              <div className="space-y-1.5">
                {modalConfira.permissoes.map((perm, index) => (
                  <div key={index} className="flex gap-2 items-center text-[10px] text-slate-500 font-bold leading-tight">
                    <div className="w-1 h-1 rounded-full bg-[#AC57EB] shrink-0" />
                    <p>{perm}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleAprovar(modalConfira.id)} className="flex-1 bg-green-500 text-white py-3.5 rounded-2xl shadow-lg flex justify-center"><Check /></button>
              <button onClick={() => setModalConfira(null)} className="flex-1 bg-slate-100 text-slate-400 py-3.5 rounded-2xl flex justify-center"><X /></button>
            </div>
          </div>
        </div>
      )}


      {modalExcluir && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 p-7">
            <div className="text-center mb-6">
              <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Encerrar Vínculo</p>
              <h4 className="text-slate-700 font-black text-xl italic">Remover Acesso?</h4>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <img src={modalExcluir.fotoProfissional} className="w-14 h-14 rounded-full object-cover grayscale opacity-50" alt="" />
                <X className="absolute inset-0 m-auto text-red-500 w-8 h-8" />
              </div>
              <div className="h-px w-8 bg-slate-100" />
              <img src={modalExcluir.fotoPaciente} className="w-14 h-14 rounded-xl bg-slate-50 opacity-50 p-1" alt="" />
            </div>

            <p className="text-center text-[11px] text-slate-400 mb-8 font-medium leading-relaxed px-2">
              O profissional <span className="font-bold text-slate-600">{modalExcluir.profissional}</span> não poderá mais visualizar os dados de {modalExcluir.paciente}.
            </p>

            <div className="flex gap-3">
              <button onClick={() => handleRemover(modalExcluir.id)} className="flex-1 bg-red-500 text-white py-3.5 rounded-2xl shadow-lg shadow-red-100 flex justify-center transition-transform active:scale-95">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => setModalExcluir(null)} className="flex-1 bg-slate-100 text-slate-400 py-3.5 rounded-2xl flex justify-center transition-transform active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}