'use client';

import { useState } from 'react';
import { 
  Bell, 
  Save, 
  Monitor, 
  ShieldCheck, 
  Type, 
  Eye, 
  Globe, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  BookOpen,
  Compass
} from 'lucide-react';

export default function AjustesPage() {
  const [saving, setSaving] = useState(false);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  
  // Controle da aba ativa na Central de Ajuda: 'tutoriais' ou 'faq'
  const [abaAjuda, setAbaAjuda] = useState<'tutoriais' | 'faq'>('tutoriais');

  // Estados das Configurações da Plataforma Web
  const [configs, setConfigs] = useState({
    tema: 'sistema',
    idioma: 'pt-BR',
    tamanhoFonte: 'normal',
    fonteDislexia: false,
    altoContraste: false,
    notificacoes: true,
    compartilharDados: false,
  });

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      alert('Ajustes da plataforma salvos com sucesso!');
    }, 1000);
  };

  const alternarFaq = (index: number) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  // Conteúdo 1: Tutoriais de Funcionamento do Sistema
  const passosSistema = [
    {
      passo: "1",
      titulo: "Configuração do Perfil Cognitivo",
      descricao: "No primeiro acesso, preencha o formulário inicial para calibrar os modelos de IA de acordo com o ritmo de aprendizado ou necessidades específicas do usuário monitorado."
    },
    {
      passo: "2",
      titulo: "Acompanhamento pelo Painel Geral",
      descricao: "Acesse a aba de relatórios diários para visualizar gráficos de evolução, sugestões de atividades customizadas e alertas preventivos gerados pela nossa inteligência de dados."
    },
    {
      passo: "3",
      titulo: "Compartilhamento com Especialistas",
      descricao: "Se necessário, você pode gerar um link seguro ou exportar relatórios em PDF na aba de relatórios para compartilhar diretamente com terapeutas, médicos ou educadores."
    }
  ];

  // Conteúdo 2: Dúvidas Frequentes (FAQ)
  const itensFaq = [
    {
      pergunta: "Como funciona a fonte para dislexia?",
      resposta: "Ao ativar essa opção, o sistema altera a tipografia padrão para a OpenDyslexic. Essa fonte possui a base dos caracteres ligeiramente mais pesada, o que ajuda a evitar a inversão ou rotação mental das letras, facilitando a leitura."
    },
    {
      pergunta: "As alterações de acessibilidade afetam outros usuários?",
      resposta: "Não. Todas as configurações feitas nesta página são locais e vinculadas estritamente ao seu perfil e ao seu navegador atual, garantindo uma experiência personalizada sem impactar os demais."
    },
    {
      pergunta: "O que o Modo de Alto Contraste altera?",
      resposta: "Ele redefine a paleta de cores para elementos de maior saturação e fundos brutos, além de acentuar as bordas de inputs e botões. É ideal para pessoas com baixa visão ou que sentem fadiga visual extrema."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Barra fixa no topo com gradiente */}
      <div className="fixed top-0 left-0 md:left-64 right-0 h-1 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      {/* Cabeçalho da Página (Título e Subtítulo) fora do grid do form */}
      <header className="mb-8 pl-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Ajustes
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Personalize sua experiência na plataforma, acesse ferramentas de acessibilidade e canais de ajuda.
        </p>
      </header>

      <form onSubmit={handleSaveConfigs} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna 1: Interface & Acessibilidade */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-[#AC57EB]"/>
              <h3 className="text-lg font-bold text-slate-800">Interface & Acessibilidade</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5"/> TEMA VISUAL
                </label>
                <select 
                  value={configs.tema}
                  onChange={(e) => setConfigs({...configs, tema: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700 cursor-pointer"
                >
                  <option value="claro" className="cursor-pointer">Modo Claro</option>
                  <option value="escuro" className="cursor-pointer">Modo Escuro (Em breve)</option>
                  <option value="sistema" className="cursor-pointer">Acompanhar o Sistema</option>
                </select>
              </div>

              {/* Tamanho da Fonte */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5"/> TAMANHO DA FONTE
                </label>
                <select 
                  value={configs.tamanhoFonte}
                  onChange={(e) => setConfigs({...configs, tamanhoFonte: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700 cursor-pointer"
                >
                  <option value="pequeno" className="cursor-pointer">Pequeno</option>
                  <option value="normal" className="cursor-pointer">Normal (Padrão)</option>
                  <option value="grande" className="cursor-pointer">Grande</option>
                  <option value="extra" className="cursor-pointer">Extra Grande</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-start gap-3">
                    <Type className="w-5 h-5 text-purple-400 mt-0.5"/>
                    <div>
                      <p className="text-sm font-bold text-purple-900">Fonte para Dislexia</p>
                      <p className="text-xs text-purple-600">Ativa a fonte OpenDyslexic para facilitar a leitura.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={configs.fonteDislexia}
                      onChange={(e) => setConfigs({...configs, fonteDislexia: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AC57EB]"></div>
                  </label>
                </div>

                {/* Toggle Alto Contraste */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-slate-400 mt-0.5"/>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Alto Contraste</p>
                      <p className="text-xs text-slate-500">Aumenta o contraste de cores e remove fundos suaves.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={configs.altoContraste}
                      onChange={(e) => setConfigs({...configs, altoContraste: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AC57EB]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Sistema & Privacidade */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-[#4078A4]"/>
              <h3 className="text-lg font-bold text-slate-800">Sistema & Notificações</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">IDIOMA DA PLATAFORMA</label>
                <select 
                  value={configs.idioma}
                  onChange={(e) => setConfigs({...configs, idioma: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all text-slate-700 cursor-pointer"
                >
                  <option value="pt-BR" className="cursor-pointer">Português (Brasil)</option>
                  <option value="en" className="cursor-pointer">English (US)</option>
                  <option value="es" className="cursor-pointer">Español</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-slate-400 mt-0.5"/>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Alertas por E-mail</p>
                    <p className="text-xs text-slate-500">Receber avisos sobre atualizações e acessos na conta.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={configs.notificacoes}
                    onChange={(e) => setConfigs({...configs, notificacoes: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4078A4]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacidade */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-4 opacity-5">
              <ShieldCheck className="w-32 h-32 text-slate-900"/>
            </div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <ShieldCheck className="w-5 h-5 text-emerald-500"/>
              <h3 className="text-lg font-bold text-slate-800">Privacidade</h3>
            </div>
            
            <div className="flex flex-col gap-4 relative z-10">
              <p className="text-sm text-slate-500">
                Gerencie como a plataforma utiliza seus dados de uso para melhorias contínuas.
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-sm font-bold text-slate-700">Compartilhar Dados Anônimos</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Ajude-nos a melhorar a IA com dados de navegação.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={configs.compartilharDados}
                    onChange={(e) => setConfigs({...configs, compartilharDados: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Completa: Central de Ajuda, Guias de Funcionamento & FAQ (Largura Total) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#4078A4]"/>
              <h3 className="text-lg font-bold text-slate-800">Central de Ajuda</h3>
            </div>
            
            {/* Alternador de Abas de Conteúdo */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              <button
                type="button"
                onClick={() => setAbaAjuda('tutoriais')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  abaAjuda === 'tutoriais' 
                    ? 'bg-white text-[#4078A4] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Como Funciona o Sistema
              </button>
              <button
                type="button"
                onClick={() => setAbaAjuda('faq')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  abaAjuda === 'faq' 
                    ? 'bg-white text-[#4078A4] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Dúvidas Frequentes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Menu Lateral de Suporte Contextual */}
            <div className="md:col-span-1 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Suporte Direto</p>
              
              <a href="#" className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition group cursor-pointer">
                <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-[#4078A4]" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Falar com o Suporte</p>
                  <p className="text-[11px] text-slate-400">Tempo de resposta em até 2h</p>
                </div>
              </a>

              <a href="#" className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition group cursor-pointer">
                <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-[#4078A4]" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Documentação Completa</p>
                  <p className="text-[11px] text-slate-400">Manuais e notas de atualização</p>
                </div>
              </a>
            </div>

            {/* Painel de Conteúdo Variável baseado na Aba Selecionada */}
            <div className="md:col-span-2">
              
              {/* Renderização Aba: Como Funciona (Linha do Tempo/Passos) */}
              {abaAjuda === 'tutoriais' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-2">Fluxo de Navegação</p>
                  <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-5">
                    {passosSistema.map((item, index) => (
                      <div key={index} className="relative">
                        {/* Indicador Numérico do Passo */}
                        <span className="absolute -left-[25px] top-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-inner">
                          {item.passo}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {item.titulo}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                            {item.descricao}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renderização Aba: Dúvidas Frequentes (FAQ Acordeão) */}
              {abaAjuda === 'faq' && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Perguntas Comuns</p>
                  
                  {itensFaq.map((item, index) => (
                    <div key={index} className="border border-slate-200/70 rounded-xl overflow-hidden bg-white transition-all">
                      <button
                        type="button"
                        onClick={() => alternarFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer"
                      >
                        <span>{item.pergunta}</span>
                        {faqAberto === index ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      
                      {faqAberto === index && (
                        <div className="p-4 pt-0 text-xs text-slate-500 border-t border-slate-100/80 bg-slate-50/50 leading-relaxed">
                          {item.resposta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="lg:col-span-2 flex justify-center mt-2">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4078A4] to-[#3E89AE] text-white px-10 py-3.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-5 h-5"/> 
            {saving ? 'Salvando ajustes...' : 'Salvar Ajustes'}
          </button>
        </div>
      </form>
    </div>
  );
}