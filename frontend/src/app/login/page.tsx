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
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
        try {
          const dadosUsuario = await resposta.json();
          console.log("4. Sucesso! Dados do usuário:", dadosUsuario);
          localStorage.setItem('user_data', JSON.stringify(dadosUsuario));
          console.log("Usuário salvo no navegador!");
          router.push('/menu');
        } catch (jsonError) {
          console.error("Erro ao processar JSON do backend:", jsonError);
          setErro('O servidor respondeu, mas os dados não estão no formato correto.');
        }
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

      {}
      <div className="hidden md:flex flex-col justify-center items-start p-16 w-1/2 bg-gradient-to-br from-purple-500 to-blue-400 text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 text-3xl">✨</div>
        <div className="absolute bottom-10 right-10 text-2xl">⭐</div>
        <h1 className="text-4xl font-bold mb-8">Ainda não tem<br />uma conta?</h1>
        <Link href="/register" className="flex items-center px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-purple-500 transition font-medium">
          <span className="mr-2">←</span> Cadastra-se
        </Link>
      </div>

      {}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">Entrar</h2>
            <p className="text-slate-500 text-sm">Para acessar a sua conta, insira os seus dados abaixo:</p>
          </div>

          <form onSubmit={fazerLogin} className="bg-slate-100 p-8 rounded-2xl shadow-inner space-y-4">

            {erro && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{erro}</div>}

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
              />
            </div>

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Senha
              </label>
              <div className="relative w-full">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha secreta"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
                />

                {}
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition focus:outline-none cursor-pointer flex items-center justify-center"
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  ) : (

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {}
            <div className="mt-8 text-center flex flex-col items-center gap-4 pt-2">
              <button type="submit" className="px-12 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full shadow-lg hover:opacity-90 transition cursor-pointer">
                ACESSAR
              </button>

              <Link href="/remember-password" className="text-xs text-[#4078A4] underline hover:text-[#2d587a] font-bold mt-2 inline-block transition-colors">
                Esqueceu a senha?
              </Link>
              
              {/* Link de Cadastro para Mobile */}
              <div className="md:hidden text-sm text-slate-500 mt-2">
                Não tem uma conta?{' '}
                <Link href="/register" className="text-purple-500 font-bold hover:underline">
                  Cadastre-se agora!
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}