"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/api';

export default function RegisterPage() {
  const router = useRouter();


  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('responsavel');
  const [erro, setErro] = useState('');


  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {

      const resposta = await fetch(`${getApiUrl()}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome,
          email: email,
          senha: senha,
          tipo_perfil: tipoPerfil
        })
      });

      if (resposta.ok) {
        console.log("Cadastro realizado com sucesso!");

        router.push('/login');
      } else {

        const dadosErro = await resposta.json();
        setErro(dadosErro.detail || 'Erro ao realizar o cadastro.');
      }
    } catch (error) {
      console.error(error);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">

      <div className="hidden md:flex flex-col justify-center items-start p-16 w-1/2 bg-gradient-to-br from-purple-500 to-blue-400 text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 text-3xl">✨</div>
        <div className="absolute bottom-10 right-10 text-2xl">⭐</div>
        <h1 className="text-4xl font-bold mb-8">Já tem uma<br />conta?</h1>
        <Link href="/login" className="flex items-center px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-purple-500 transition font-medium">
          <span className="mr-2">←</span> Acesse já
        </Link>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">Cadastrar</h2>
            <p className="text-slate-500 text-sm">Preencha os dados e escolha o seu tipo de usuário.</p>
          </div>

          <form onSubmit={fazerCadastro} className="bg-slate-100 p-6 rounded-2xl shadow-inner space-y-3">

            {erro && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">{erro}</div>}

            <input
              type="text"
              placeholder="👤 Nome:"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="email"
              placeholder="✉️ Email:"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="password"
              placeholder="🔒 Senha:"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            <div className="pt-2 space-y-2">
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${tipoPerfil === 'responsavel' ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="role"
                  value="responsavel"
                  checked={tipoPerfil === 'responsavel'}
                  onChange={(e) => setTipoPerfil(e.target.value)}
                  className="mr-3 accent-purple-500"
                />
                <span>❤️ Responsável</span>
              </label>

              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${tipoPerfil === 'especialista' ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  name="role"
                  value="especialista"
                  checked={tipoPerfil === 'especialista'}
                  onChange={(e) => setTipoPerfil(e.target.value)}
                  className="mr-3 accent-blue-500"
                />
                <span>🧠 Especialista</span>
              </label>
            </div>

            <div className="mt-6 text-center pt-4">
              <button type="submit" className="px-12 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full shadow-lg hover:opacity-90 transition inline-block cursor-pointer">
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}