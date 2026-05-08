'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

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

    if (novaSenha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/redefinir-senha', {
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
      <div className="py-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Senha Alterada!</h2>
        <p className="text-sm text-slate-500 mb-8">
          Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-[#4078A4] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#3E89AE] transition-all"
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
        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-slate-500 ml-1">NOVA SENHA</label>
          <div className="relative flex items-center mt-1">
            <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-xs font-bold text-slate-500 ml-1">CONFIRMAR SENHA</label>
          <div className="relative flex items-center mt-1">
            <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#AC57EB] to-[#4078A4] text-white py-3 rounded-xl font-bold shadow-md hover:brightness-110 transition-all disabled:opacity-50 mt-6"
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
          <Image src="/icons/logo.png" alt="Cosmic Mind" width={150} height={40} />
        </div>
        
        {/* Suspense é necessário no Next.js ao usar useSearchParams() */}
        <Suspense fallback={<p className="text-center text-slate-400">Carregando formulário...</p>}>
          <RedefinirSenhaForm />
        </Suspense>

      </div>
    </div>
  );
}