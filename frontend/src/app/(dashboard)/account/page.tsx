'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff, CheckCircle2, Clock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/api';

export default function AccountPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState({ nome: '', tipo_perfil: '', email: '', crp_especialista: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [isLoading, setIsLoading] = useState(true);


  const [formData, setFormData] = useState({ nome: '', email: '', crp_especialista: '' });
  const [passData, setPassData] = useState({ atual: '', nova: '', confirmar: '' });


  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailPendente, setEmailPendente] = useState('');

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('user_data');
    if (dadosSalvos) {
      const parsed = JSON.parse(dadosSalvos);
      const emailReal = parsed.email || '';
      setUsuario({ ...parsed, email: emailReal });
      setFormData({ nome: parsed.nome, email: emailReal, crp_especialista: parsed.crp_especialista || '' });
      if (parsed.avatar) {
        setSelectedAvatar(parsed.avatar.toString());
      }


      if (parsed.email_pendente) {
        setEmailPendente(parsed.email_pendente);
      }
    }
    setIsLoading(false);
  }, []);

  const avatares = [1, 2, 3, 4];

  const handleAvatarChange = async (novoId: string) => {
    setSelectedAvatar(novoId);
    try {
      await fetch(`${getApiUrl()}/conta/atualizar/${usuario.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar: parseInt(novoId)
        }),
      });

      const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
      dadosSalvos.avatar = parseInt(novoId);
      localStorage.setItem('user_data', JSON.stringify(dadosSalvos));
    } catch (err) {
      console.error(err);
    }
  };


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const response = await fetch(`${getApiUrl()}/conta/atualizar/${usuario.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          avatar: parseInt(selectedAvatar),
          ...(formData.crp_especialista && { crp_especialista: formData.crp_especialista })
        }),
      });

      const data = await response.json();

      if (usuario.tipo_perfil === 'especialista') {
        await fetch(`${getApiUrl()}/conta/crp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: usuario.email, crp: formData.crp_especialista })
        });
      }

      if (response.ok) {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');

        if (data.email_trocado === "pendente") {
          alert('Um link de verificação foi enviado para o seu novo e-mail!');
          setEmailPendente(formData.email);


          dadosSalvos.email_pendente = formData.email;

          setFormData((prev: any) => ({ ...prev, email: usuario.email }));
        }
        else {
          alert('Perfil atualizado com sucesso!');
        }


        dadosSalvos.nome = formData.nome;
        if (usuario.tipo_perfil === 'especialista') {
          dadosSalvos.crp_especialista = formData.crp_especialista;
        }
        localStorage.setItem('user_data', JSON.stringify(dadosSalvos));
        setUsuario((prev: any) => ({ ...prev, nome: formData.nome }));

      } else {
        let mensagemErro = 'Erro desconhecido ao atualizar.';
        if (data.detail) {
          if (typeof data.detail === 'string') mensagemErro = data.detail;
          else if (Array.isArray(data.detail)) mensagemErro = data.detail[0].msg;
        }
        alert(`Erro: ${mensagemErro}`);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setSavingProfile(false);
    }
  };


  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passData.nova !== passData.confirmar) {
      alert('As novas senhas não coincidem!');
      return;
    }

    if (passData.nova.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch(`${getApiUrl()}/conta/senha/${usuario.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senha_atual: passData.atual,
          nova_senha: passData.nova
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Senha alterada com segurança!');
        setPassData({ atual: '', nova: '', confirmar: '' });
      } else {
        alert(`Erro: ${data.detail}`);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) return <div className="p-10 text-slate-400 font-bold text-center">Carregando dados da conta...</div>;

  return (
    <div className="max-w-6xl mx-auto p-2 lg:p-6 font-sans">
      <div className="fixed top-0 left-0 md:left-64 right-0 h-1 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <header className="mb-8 pl-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Minha Conta
        </h2>
        <p className="text-slate-400 text-sm font-medium">Gerencie suas informações, segurança e identidade visual.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full shadow-lg mb-5 transition-all duration-300 overflow-hidden ring-4 ring-slate-100">
              <img src={`/usuarios/foto${selectedAvatar}.png`} alt="Avatar do Usuário" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{usuario.nome}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-8">{usuario.tipo_perfil}</p>

            <div className="w-full pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-bold mb-4 text-left">ESTILO DO AVATAR</p>
              <div className="flex gap-4 justify-center">
                {avatares.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleAvatarChange(id.toString())}
                    className={`w-12 h-12 rounded-full transition-all duration-300 shadow-sm overflow-hidden ${selectedAvatar === id.toString() ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105 ring-1 ring-slate-200'}`}
                    title={`Foto ${id}`}
                  >
                    <img src={`/usuarios/foto${id}.png`} alt={`Opção de avatar ${id}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className="lg:col-span-2 space-y-6">


          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[#4078A4]" />
              <h3 className="text-lg font-bold text-slate-800">Dados Pessoais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">NOME COMPLETO</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all"
                  required
                />
              </div>


              {emailPendente ? (
                <div className="space-y-3">

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">E-MAIL ATUAL</label>
                    <input
                      type="email"
                      value={usuario.email}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>


                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 relative shadow-sm"> {/* <-- ESSA DIV HAVIA SUMIDO! */}
                    <button
                      type="button"
                      onClick={async () => {
                        setEmailPendente('');
                        setFormData((prev: any) => ({ ...prev, email: usuario.email }));

                        try {
                          await fetch(`${getApiUrl()}/conta/cancelar-troca-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: usuario.email })
                          });
                        } catch (error) {
                          console.error('Erro ao cancelar:', error);
                        }

                        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
                        delete dadosSalvos.email_pendente;
                        localStorage.setItem('user_data', JSON.stringify(dadosSalvos));
                      }}
                      className="absolute top-3 right-3 text-amber-500 hover:bg-amber-100 rounded-md p-1 transition-colors"
                      title="Cancelar troca de e-mail"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Aguardando Verificação</span>
                    </div>
                    <p className="text-sm font-bold text-amber-900 pr-8 break-all">{emailPendente}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">E-MAIL (LOGIN)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all"
                    required
                  />
                </div>
              )}

              {usuario.tipo_perfil === 'especialista' && (
                <div className="bg-slate-50 p-4 rounded-2xl md:col-span-2 border border-slate-100">
                  <label className="text-xs font-bold text-slate-500 ml-1">NÚMERO DO CRP (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 00/00000"
                    value={formData.crp_especialista}
                    onChange={(e) => setFormData({ ...formData, crp_especialista: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all mt-1"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 ml-1">Obrigatório para emissão de laudos técnicos</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 bg-[#4078A4] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#3E89AE] transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'Salvando...' : 'Atualizar Perfil'}
              </button>
            </div>
          </form>


          <form onSubmit={handleSavePassword} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-[#AC57EB]" />
              <h3 className="text-lg font-bold text-slate-800">Segurança</h3>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">SENHA ATUAL</label>
                <input
                  type="password"
                  value={passData.atual}
                  onChange={(e) => setPassData({ ...passData, atual: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-500 ml-1">NOVA SENHA</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passData.nova}
                    onChange={(e) => setPassData({ ...passData, nova: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">CONFIRMAR NOVA SENHA</label>
                <input
                  type="password"
                  value={passData.confirmar}
                  onChange={(e) => setPassData({ ...passData, confirmar: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Senha criptografada
              </p>
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 bg-[#AC57EB] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-50"
              >
                {savingPassword ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}