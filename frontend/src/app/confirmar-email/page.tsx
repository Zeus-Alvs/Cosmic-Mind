'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

function ConfirmarEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'carregando' | 'sucesso' | 'erro'>('carregando');
  const [mensagem, setMensagem] = useState('Verificando seu novo e-mail...');

  useEffect(() => {
    if (!token) {
      setStatus('erro');
      setMensagem('Link inválido ou sem token de verificação.');
      return;
    }


    const confirmarNoBackend = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/conta/confirmar-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('sucesso');
          setMensagem('Seu e-mail foi atualizado com sucesso no Cosmic Mind!');


          localStorage.removeItem('user_data');
        } else {
          setStatus('erro');
          setMensagem(data.detail || 'Token inválido ou expirado.');
        }
      } catch (error) {
        setStatus('erro');
        setMensagem('Erro de conexão com o servidor. Tente novamente mais tarde.');
      }
    };

    confirmarNoBackend();
  }, [token]);

  return (
    <div className="text-center">
      {status === 'carregando' && (
        <div className="py-8">
          <Loader2 className="w-16 h-16 text-[#4078A4] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Validando E-mail</h2>
          <p className="text-sm text-slate-500">{mensagem}</p>
        </div>
      )}

      {status === 'sucesso' && (
        <div className="py-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tudo Certo!</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            {mensagem} Por segurança, pedimos que você faça login novamente com seu novo endereço.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4078A4] to-[#3E89AE] text-white py-3.5 rounded-xl font-bold shadow-md hover:brightness-110 transition-all"
          >
            Fazer Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === 'erro' && (
        <div className="py-6">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-red-50">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ops, algo deu errado</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">{mensagem}</p>
          <Link
            href="/account"
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
          >
            Voltar para a Conta
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-xl border border-slate-100 p-8">
        <div className="flex justify-center mb-8 pb-6 border-b border-slate-100">
          <Image src="/icons/logo.png" alt="Cosmic Mind" width={150} height={40} />
        </div>


        <Suspense fallback={<p className="text-center text-slate-400 py-10 font-bold">Iniciando verificação...</p>}>
          <ConfirmarEmailContent />
        </Suspense>
      </div>
    </div>
  );
}