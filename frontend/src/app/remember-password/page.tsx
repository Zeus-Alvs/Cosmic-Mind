'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEnviado(true);
      } else {
        alert('Ocorreu um erro ao tentar enviar o e-mail.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-xl border border-slate-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <Image src="/icons/logo.png" alt="Cosmic Mind" width={150} height={40} />
        </div>

        {!enviado ? (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Esqueceu sua senha?</h2>
            <p className="text-sm text-slate-500 mb-8">
              Digite seu e-mail cadastrado e enviaremos um link para você criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative text-left">
                <label className="text-xs font-bold text-slate-500 ml-1">SEU E-MAIL</label>
                <div className="relative flex items-center mt-1">
                  <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all"
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4078A4] to-[#AC57EB] text-white py-3 rounded-xl font-bold shadow-md hover:brightness-110 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? 'Enviando...' : <><Send className="w-4 h-4" /> Enviar Link</>}
              </button>
            </form>
          </>
        ) : (
          <div className="py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">E-mail Enviado!</h2>
            <p className="text-sm text-slate-500 mb-8">
              Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link de recuperação em instantes. Verifique também a caixa de spam.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-[#4078A4] font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}