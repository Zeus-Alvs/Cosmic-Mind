'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff, CheckCircle2, Clock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { error } from 'console';

export default function AccountPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState({ nome: '', tipo_perfil: '', email: '', registro: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos formulários
  const [formData, setFormData] = useState({ nome: '', email: '', registro: '' });
  const [passData, setPassData] = useState({ atual: '', nova: '', confirmar: '' });
  
  // Status de carregamento e pendências
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailPendente, setEmailPendente] = useState(''); // <-- NOVO ESTADO!

 useEffect(() => {
    const dadosSalvos = localStorage.getItem('user_data');
    if (dadosSalvos) {
      const parsed = JSON.parse(dadosSalvos);
      const emailReal = parsed.email || ''; 
      setUsuario({ ...parsed, email: emailReal });
      setFormData({ nome: parsed.nome, email: emailReal, registro: parsed.registro || '' });
      
      // LÊ O CACHE: Se tiver email pendente salvo, ativa o card amarelo na hora
      if (parsed.email_pendente) {
        setEmailPendente(parsed.email_pendente);
      }
    }
    setIsLoading(false);
  }, []);

  const avatares = [
    { id: '1', cor: 'bg-gradient-to-br from-[#AC57EB] to-[#4078A4]', label: 'Padrão' },
    { id: '2', cor: 'bg-gradient-to-br from-emerald-400 to-teal-500', label: 'Verde' },
    { id: '3', cor: 'bg-gradient-to-br from-orange-400 to-rose-500', label: 'Fogo' },
    { id: '4', cor: 'bg-gradient-to-br from-slate-700 to-slate-900', label: 'Dark' },
  ];

  // 1. FUNÇÃO QUE SALVA OS DADOS PESSOAIS
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/conta/atualizar/${usuario.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          avatar: selectedAvatar,
          ...(formData.registro && { registro: formData.registro }) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}'); // Puxa o cache atual

        if (data.email_trocado === "pendente") {
          alert('Um link de verificação foi enviado para o seu novo e-mail!');
          setEmailPendente(formData.email); 
          
          // SALVA NO CACHE: Grava o email pendente para sobreviver ao F5
          dadosSalvos.email_pendente = formData.email; 
          
          setFormData(prev => ({ ...prev, email: usuario.email })); 
        } 
        else {
          alert('Perfil atualizado com sucesso!');
        }

        // Atualiza o resto e salva no LocalStorage
        dadosSalvos.nome = formData.nome;
        localStorage.setItem('user_data', JSON.stringify(dadosSalvos));
        setUsuario(prev => ({ ...prev, nome: formData.nome }));
        
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

  // 2. FUNÇÃO QUE TROCA A SENHA
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
      const response = await fetch(`http://127.0.0.1:8000/api/conta/senha/${usuario.email}`, {
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
        
        {/* COLUNA ESQUERDA: Perfil e Avatares */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg mb-5 transition-all duration-300 ${avatares.find(a => a.id === selectedAvatar)?.cor}`}>
              {usuario.nome.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{usuario.nome}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-8">{usuario.tipo_perfil}</p>
            
            <div className="w-full pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-bold mb-4 text-left">ESTILO DO AVATAR</p>
              <div className="flex gap-4 justify-center">
                {avatares.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`w-12 h-12 rounded-full transition-all duration-300 shadow-sm ${avatar.cor} ${selectedAvatar === avatar.id ? 'ring-4 ring-offset-2 ring-[#4078A4] scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                    title={avatar.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Formulários */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Form: Dados Pessoais */}
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
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all"
                  required
                />
              </div>

              {/* LÓGICA DO CARD DE E-MAIL PENDENTE */}
              {emailPendente ? (
                <div className="space-y-3">
                  {/* Mostra o e-mail oficial bloqueado */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">E-MAIL ATUAL</label>
                    <input 
                      type="email" 
                      value={usuario.email} 
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Card do e-mail pendente logo abaixo */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 relative shadow-sm"> {/* <-- ESSA DIV HAVIA SUMIDO! */}
                    <button 
                      type="button" 
                      onClick={async () => {
                        setEmailPendente('');
                        setFormData(prev => ({ ...prev, email: usuario.email }));

                        try {
                          await fetch('http://127.0.0.1:8000/api/conta/cancelar-troca-email', {
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all"
                    required
                  />
                </div>
              )}

              {usuario.tipo_perfil === 'especialista' && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">REGISTRO PROFISSIONAL (CRP/CRM)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: CRP 00/00000"
                    value={formData.registro}
                    onChange={(e) => setFormData({...formData, registro: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all"
                  />
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

          {/* Form: Segurança e Senha */}
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
                  onChange={(e) => setPassData({...passData, atual: e.target.value})}
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
                    onChange={(e) => setPassData({...passData, nova: e.target.value})}
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
                  onChange={(e) => setPassData({...passData, confirmar: e.target.value})}
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