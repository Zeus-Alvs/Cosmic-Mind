"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/api';

export default function RegisterPage() {
  const router = useRouter();

  // Estados principais
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('responsavel');
  const [erro, setErro] = useState('');

  // Estados dos campos de especialista
  const [crm, setCrm] = useState('');
  const [clinica, setClinica] = useState('');
  const [ocupacao, setOcupacao] = useState('');

  // Estados de IHC/UX
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Atualizado para refletir as novas regras
  const [senhaRegras, setSenhaRegras] = useState({
    minCaracteres: false,
    temMaiuscula: false,
    temNumero: false,
    temEspecial: false,
  });

  // Validação em tempo real das novas regras da senha
  useEffect(() => {
    setSenhaRegras({
      minCaracteres: senha.length >= 8,
      temMaiuscula: /[A-Z]/.test(senha),
      temNumero: /\d/.test(senha),
      temEspecial: /[^a-zA-Z0-9]/.test(senha), // Detecta qualquer caractere que não seja letra ou número
    });
  }, [senha]);

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validação estrita baseada nas novas regras
    if (
      !senhaRegras.minCaracteres || 
      !senhaRegras.temMaiuscula || 
      !senhaRegras.temNumero || 
      !senhaRegras.temEspecial
    ) {
      setErro('Sua senha não atende aos requisitos de segurança.');
      return;
    }

    try {
      const payload = {
        nome,
        email,
        senha,
        tipo_perfil: tipoPerfil,
        ...(tipoPerfil === 'especialista' && { crm, clinica, ocupacao })
      };

      const resposta = await fetch(`${getApiUrl()}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resposta.ok) {
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
    <div className="flex min-h-screen w-full bg-white">
      
      {/* Lado Esquerdo - Boas-vindas */}
      <div className="hidden md:flex flex-col justify-center items-start p-16 w-1/2 bg-gradient-to-br from-purple-500 to-blue-400 text-white relative overflow-hidden">
        <h1 className="text-4xl font-bold mb-8">Já tem uma<br />conta?</h1>
        <Link href="/login" className="flex items-center px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-purple-500 transition font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Acesse já
        </Link>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 my-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">Cadastrar</h2>
            <p className="text-slate-500 text-sm">Preencha os dados e escolha o seu tipo de usuário.</p>
          </div>

          <form onSubmit={fazerCadastro} className="bg-slate-100 p-6 rounded-2xl shadow-inner space-y-4">
            
            {erro && (
              <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {erro}
              </div>
            )}

            {/* Seletor de Perfil */}
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-slate-700">Quero me cadastrar como:</span>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition ${tipoPerfil === 'responsavel' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="responsavel"
                    checked={tipoPerfil === 'responsavel'}
                    onChange={(e) => setTipoPerfil(e.target.value)}
                    className="mr-2 accent-purple-500"
                  />
                  <span className="text-sm font-medium text-slate-800">Responsável</span>
                </label>

                <label className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition ${tipoPerfil === 'especialista' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="especialista"
                    checked={tipoPerfil === 'especialista'}
                    onChange={(e) => setTipoPerfil(e.target.value)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-800">Especialista</span>
                </label>
              </div>
            </div>

            {/* Campo: Nome */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="nome" className="text-sm font-semibold text-slate-700">Nome Completo</label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
              />
            </div>

            {/* Campo: Email */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="Ex: seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
              />
            </div>

            {/* Campo: Senha com Toggle de Visibilidade e Quadro de Aviso */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="senha" className="text-sm font-semibold text-slate-700">Senha</label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    // Ícone Olho Aberto
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    // Ícone Olho Fechado
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  )}
                </button>
              </div>

              {/* Quadro Amarelo de Atenção Atualizado */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mt-2 text-xs text-amber-900 space-y-1.5 shadow-sm">
                <div className="flex items-center font-bold text-amber-800 gap-1.5 mb-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ⚠️ Regras para uma senha segura:
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${senhaRegras.minCaracteres ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                  <span className={senhaRegras.minCaracteres ? 'line-through text-slate-400' : ''}>Deve conter no mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${senhaRegras.temMaiuscula ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                  <span className={senhaRegras.temMaiuscula ? 'line-through text-slate-400' : ''}>Inclua pelo menos uma letra maiúscula</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${senhaRegras.temNumero ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                  <span className={senhaRegras.temNumero ? 'line-through text-slate-400' : ''}>Use números</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${senhaRegras.temEspecial ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                  <span className={senhaRegras.temEspecial ? 'line-through text-slate-400' : ''}>Use um caractere especial (ex: @, #, $)</span>
                </div>
              </div>
            </div>

            {/* Campos Ocultos para Especialista */}
            {tipoPerfil === 'especialista' && (
              <div className="pt-2 border-t border-slate-200 space-y-3 transition-all duration-300">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Dados Profissionais</p>
                
                <div className="flex flex-col space-y-1">
                  <label htmlFor="crm" className="text-sm font-semibold text-slate-700">CRM / Registro Profissional</label>
                  <input
                    id="crm"
                    type="text"
                    placeholder="Ex: CRM/SP 123456"
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    required={tipoPerfil === 'especialista'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="ocupacao" className="text-sm font-semibold text-slate-700">Ocupação / Especialidade</label>
                  <input
                    id="ocupacao"
                    type="text"
                    placeholder="Ex: Psicólogo Infantil, Pediatra"
                    value={ocupacao}
                    onChange={(e) => setOcupacao(e.target.value)}
                    required={tipoPerfil === 'especialista'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="clinica" className="text-sm font-semibold text-slate-700">Nome da Clínica (Opcional)</label>
                  <input
                    id="clinica"
                    type="text"
                    placeholder="Ex: Clínica Viva Bem"
                    value={clinica}
                    onChange={(e) => setClinica(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <div className="text-center pt-2">
              <button 
                type="submit" 
                className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition transform active:scale-95 cursor-pointer ${
                  tipoPerfil === 'especialista' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90'
                }`}
              >
                Concluir Cadastro
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}