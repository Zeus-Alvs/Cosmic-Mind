'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/utils/api';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Check } from 'lucide-react';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // IHC: Estados independentes para visibilidade de cada campo de senha
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estado das regras atualizado para incluir maiúsculas e especiais
  const [senhaRegras, setSenhaRegras] = useState({
    minCaracteres: false,
    temMaiuscula: false,
    temNumero: false,
    temEspecial: false,
  });

  // Validação em tempo real conforme digitação com as novas regras
  useEffect(() => {
    setSenhaRegras({
      minCaracteres: novaSenha.length >= 8,
      temMaiuscula: /[A-Z]/.test(novaSenha),
      temNumero: /\d/.test(novaSenha),
      temEspecial: /[^a-zA-Z0-9]/.test(novaSenha), // Qualquer caractere que não seja letra ou número
    });
  }, [novaSenha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('Token de recuperação ausente. Use o link enviado para o seu e-mail.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // Trava de segurança atualizada com as 4 regras obrigatórias
    if (
      !senhaRegras.minCaracteres || 
      !senhaRegras.temMaiuscula || 
      !senhaRegras.temNumero || 
      !senhaRegras.temEspecial
    ) {
      alert('A senha não cumpre todos os requisitos de segurança.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/auth/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nova_senha: novaSenha }),
      });

      const data = await res.json();

      if (res.ok) {
        setSucesso(true);
      } else {
        alert(`Erro: ${data.detail || 'Token inválido ou expirado'}`);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="py-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Senha Alterada!</h2>
        <p className="text-sm text-slate-500 mb-8">
          Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-[#4078A4] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#3E89AE] transition-all cursor-pointer"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Criar Nova Senha</h2>
      <p className="text-sm text-slate-500 mb-8">Digite sua nova senha abaixo.</p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        
        {/* Campo: Nova Senha */}
        <div className="space-y-1 relative">
          <label htmlFor="novaSenha" className="text-xs font-bold text-slate-500 ml-1">NOVA SENHA</label>
          <div className="relative flex items-center mt-1">
            <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              id="novaSenha"
              type={showNovaSenha ? "text" : "password"}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-800"
              placeholder="Ex: SenhaForte@123"
            />
            <button
              type="button"
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              title={showNovaSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {showNovaSenha ? <Eye className="w-5 h-5 text-[#AC57EB]" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Quadro Amarelo de Alerta Atualizado com as 4 Regras */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 text-xs text-amber-900 space-y-1.5 shadow-sm">
            <div className="flex items-center font-bold text-amber-800 gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Regras para uma senha segura:
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${senhaRegras.minCaracteres ? 'bg-green-500 border-green-600 text-white' : 'bg-amber-100 border-amber-300'}`}>
                {senhaRegras.minCaracteres && <Check className="w-2.5 h-2.5" />}
              </div>
              <span className={senhaRegras.minCaracteres ? 'line-through text-slate-400' : 'text-amber-900'}>Deve conter no mínimo 8 caracteres</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${senhaRegras.temMaiuscula ? 'bg-green-500 border-green-600 text-white' : 'bg-amber-100 border-amber-300'}`}>
                {senhaRegras.temMaiuscula && <Check className="w-2.5 h-2.5" />}
              </div>
              <span className={senhaRegras.temMaiuscula ? 'line-through text-slate-400' : 'text-amber-900'}>Inclua pelo menos uma letra maiúscula</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${senhaRegras.temNumero ? 'bg-green-500 border-green-600 text-white' : 'bg-amber-100 border-amber-300'}`}>
                {senhaRegras.temNumero && <Check className="w-2.5 h-2.5" />}
              </div>
              <span className={senhaRegras.temNumero ? 'line-through text-slate-400' : 'text-amber-900'}>Use números</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${senhaRegras.temEspecial ? 'bg-green-500 border-green-600 text-white' : 'bg-amber-100 border-amber-300'}`}>
                {senhaRegras.temEspecial && <Check className="w-2.5 h-2.5" />}
              </div>
              <span className={senhaRegras.temEspecial ? 'line-through text-slate-400' : 'text-amber-900'}>Use um caractere especial (ex: @, #, $)</span>
            </div>
          </div>
        </div>

        {/* Campo: Confirmar Senha */}
        <div className="space-y-1 relative">
          <label htmlFor="confirmarSenha" className="text-xs font-bold text-slate-500 ml-1">CONFIRMAR SENHA</label>
          <div className="relative flex items-center mt-1">
            <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              id="confirmarSenha"
              type={showConfirmarSenha ? "text" : "password"}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-800"
              placeholder="Repita a senha digitada acima"
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              title={showConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirmarSenha ? <Eye className="w-5 h-5 text-[#AC57EB]" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Feedback dinâmico se as duas senhas estão iguais */}
          {confirmarSenha && (
            <p className={`text-xs pl-1 mt-1 font-semibold ${novaSenha === confirmarSenha ? 'text-green-600' : 'text-red-500'}`}>
              {novaSenha === confirmarSenha ? '✓ As senhas coincidem' : '✕ As senhas ainda não coincidem'}
            </p>
          )}
        </div>

        {/* Botão Submeter */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#AC57EB] to-[#4078A4] text-white py-3 rounded-xl font-bold shadow-md hover:brightness-110 transition-all disabled:opacity-50 mt-6 cursor-pointer"
        >
          {loading ? 'Salvando...' : 'Redefinir Senha'}
        </button>
      </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-xl border border-slate-100 p-8">
        <div className="flex justify-center mb-6">
          <Image src="/icons/logo.png" alt="Cosmic Mind" width={150} height={40} priority />
        </div>

        <Suspense fallback={<p className="text-center text-slate-400">Carregando formulário...</p>}>
          <RedefinirSenhaForm />
        </Suspense>
      </div>
    </div>
  );
}