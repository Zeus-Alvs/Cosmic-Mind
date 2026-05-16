"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();


    console.log("1. O botão Acessar foi clicado!");
    console.log("2. Dados que vão pro Python:", { email, senha });

    setErro('');

    try {
      const resposta = await fetch(`${getApiUrl()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      console.log("3. O Python respondeu com o status:", resposta.status);

      if (resposta.ok) {
        const dadosUsuario = await resposta.json();
        console.log("4. Sucesso! Dados do usuário:", dadosUsuario);
        localStorage.setItem('user_data', JSON.stringify(dadosUsuario));
        console.log("Usuário salvo no navegador!");
        router.push('/menu');
      } else {
        console.log("4. Senha errada ou usuário não existe.");
        setErro('E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error("ERRO GRAVE:", error);
      setErro('Erro ao conectar com o servidor. O back-end está rodando?');
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">

      <div className="hidden md:flex flex-col justify-center items-start p-16 w-1/2 bg-gradient-to-br from-purple-500 to-blue-400 text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 text-3xl">✨</div>
        <div className="absolute bottom-10 right-10 text-2xl">⭐</div>
        <h1 className="text-4xl font-bold mb-8">Ainda não tem<br />uma conta?</h1>
        <Link href="/register" className="flex items-center px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-purple-500 transition font-medium">
          <span className="mr-2">←</span> Cadastra-se
        </Link>
      </div>


      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">Entrar</h2>
            <p className="text-slate-500 text-sm">Para acessar a sua conta, insira os seus dados abaixo:</p>
          </div>

          <form onSubmit={fazerLogin} className="bg-slate-100 p-8 rounded-2xl shadow-inner space-y-4">

            {erro && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{erro}</div>}

            <div>
              <input
                type="email"
                placeholder="👤 E-mail:"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="🔒 Senha:"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="mt-8 text-center flex flex-col items-center gap-4 pt-4">
              <button type="submit" className="px-12 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full shadow-lg hover:opacity-90 transition cursor-pointer">
                ACESSAR
              </button>
              <Link href="/remember-password" className="text-xs text-[#4078A4] hover:underline font-bold mt-2 inline-block">
                Esqueceu a senha?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}