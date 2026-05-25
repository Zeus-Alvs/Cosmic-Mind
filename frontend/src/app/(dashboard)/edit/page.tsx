'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Trash2, ArrowLeft, User, X } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

function EditPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idJogador = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(true);

    const [nomeJogador, setNomeJogador] = useState('');
    const [avatarIndex, setAvatarIndex] = useState(1);
    const [usuarioId, setUsuarioId] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [senha, setSenha] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const voltar = () => {
        router.push('/manager');
    };

    useEffect(() => {
        const carregarDados = async () => {
            if (!idJogador) {
                voltar();
                return;
            }

            const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
            if (!dadosSalvos.id) {
                voltar();
                return;
            }
            setUsuarioId(dadosSalvos.id);

            try {
                const response = await fetch(`${getApiUrl()}/jogadores/` + dadosSalvos.id);
                if (response.ok) {
                    const jogadores = await response.json();
                    const jogadorSelecionado = jogadores.find((j: any) => j.id === idJogador);

                    if (jogadorSelecionado) {
                        setNomeJogador(jogadorSelecionado.nome);
                        if (jogadorSelecionado.foto_perfil) {
                            setAvatarIndex(jogadorSelecionado.foto_perfil);
                        }
                    } else {
                        voltar();
                    }
                } else {
                    voltar();
                }
            } catch (error) {
                console.error('Erro ao buscar jogador:', error);
                voltar();
            } finally {
                setIsLoading(false);
            }
        };

        carregarDados();
    }, [idJogador, router]);

    const handleSalvar = async () => {
        if (!nomeJogador.trim()) return;
        setIsSaving(true);

        try {
            const response = await fetch(`${getApiUrl()}/jogadores/${idJogador}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apelido: nomeJogador, foto_perfil: avatarIndex })
            });

            if (response.ok) {
                alert('Alterações salvas com sucesso!');
            } else {
                alert('Erro ao salvar alterações.');
            }
        } catch (error) {
            alert('Erro de conexão ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDesconectar = async () => {
        try {
            const response = await fetch(`${getApiUrl()}/jogadores/${idJogador}/desconectar`, {
                method: 'POST'
            });
            if (response.ok) {
                alert('Dispositivos desconectados com sucesso!');
            } else {
                alert('Erro ao desconectar dispositivos.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        }
    };

    const handleConfirmarExclusao = async () => {
        if (!senha) return;

        try {
            const response = await fetch(`${getApiUrl()}/jogadores/${usuarioId}/${idJogador}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha })
            });

            if (response.ok) {
                alert('Jogador excluído com sucesso!');
                voltar();
            } else {
                const errData = await response.json();
                alert(`Erro: ${errData.detail || 'Senha incorreta.'}`);
            }
        } catch (error) {
            alert('Erro de conexão ao excluir.');
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-400 font-bold">Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-8 relative -mt-5">
            <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

            {}
            <div className="flex items-center justify-center relative mb-6">
                <button
                    onClick={voltar}
                    className="absolute left-0 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent">
                    Perfil do Jogador
                </h2>
            </div>

            <div className="text-center mb-16">
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Você pode <strong>trocar o avatar</strong>, <strong>alterar</strong> o nome, <strong>excluir</strong> ou <strong>desconectar</strong> a <span className="underline">CONTA DO JOGADOR</span>
                </p>
            </div>

            <div className="max-w-md mx-auto bg-[#F7F4F5] rounded-[30px] border border-[#EBE5E8] shadow-sm relative pt-20 pb-8 px-8 mb-10">

                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                    <div className="w-32 h-32 rounded-full border-4 border-[#F7F4F5] shadow-lg overflow-hidden bg-slate-100">
                        <img src={`/jogadores/foto${avatarIndex}.png`} alt="Avatar Principal" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3, 4].map((idx) => (
                        <button
                            key={idx}
                            onClick={() => setAvatarIndex(idx)}
                            className={`w-12 h-12 rounded-full border-2 transition-all overflow-hidden bg-slate-200 flex items-center justify-center cursor-pointer ${avatarIndex === idx ? 'border-[#AC57EB] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                        >
                            <img src={`/jogadores/foto${idx}.png`} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={nomeJogador}
                        onChange={(e) => setNomeJogador(e.target.value)}
                        className="w-full bg-[#E8E3E6] border border-[#D9D3D6] text-slate-700 text-sm rounded-full pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#AC57EB]/50 transition-all font-medium placeholder-slate-400"
                        placeholder="Nome do Jogador"
                    />
                </div>

                <button
                    onClick={handleSalvar}
                    disabled={isSaving || !nomeJogador.trim()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4078A4] to-[#AC57EB] text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                >
                    {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>

            </div>

            <div className="max-w-md mx-auto flex items-center gap-4">
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex-1 py-3.5 rounded-xl bg-[#EB5757] text-white font-bold text-sm shadow-md hover:bg-red-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Trash2 className="w-5 h-5" />
                    Excluir Conta
                </button>

                <button
                    onClick={handleDesconectar}
                    className="flex-1 py-3.5 rounded-xl bg-[#595959] text-white font-bold text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    Desconectar
                </button>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[30px] p-8 w-full max-w-sm shadow-2xl relative text-center">

                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-red-500 mb-2 mt-4">Excluir perfil permanentemente?</h3>
                        <p className="text-xs text-slate-500 mb-6">
                            Esta ação <strong>não pode ser desfeita</strong>. Todo o progresso, histórico e configurações deste jogador serão apagados.
                        </p>

                        <input
                            type="password"
                            placeholder="Digite sua senha para confirmar"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all text-center mb-6"
                        />

                        <button
                            onClick={handleConfirmarExclusao}
                            disabled={!senha}
                            className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Confirmar Exclusão
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default function EditPlayerPage() {
    return (
        <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-slate-400 font-bold">Carregando...</p>
            </div>
        }>
            <EditPageContent />
        </Suspense>
    );
}