'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, Save, Monitor, ShieldCheck, Type, Eye, 
  HelpCircle, ChevronDown, ChevronUp, MessageSquare, 
  BookOpen, Compass, Download, Volume2
} from 'lucide-react';

export default function AjustesPage() {
  const [saving, setSaving] = useState(false);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [abaAjuda, setAbaAjuda] = useState<'tutoriais' | 'faq'>('tutoriais');

  const [configs, setConfigs] = useState({
    tema: 'sistema',
    idioma: 'pt-BR',
    tamanhoFonte: 'normal',
    fonteDislexia: false,
    altoContraste: false,
    compartilharDados: false,
    feedbackSonoro: false,
    notificacoesAtivas: true, // Padrão ligado
  });

  useEffect(() => {
    const salvaDislexia = localStorage.getItem('pref_dislexia') === 'true';
    const salvaContraste = localStorage.getItem('pref_contraste') === 'true';
    const salvaTamanho = localStorage.getItem('pref_tamanho') || 'normal';
    const salvaTema = localStorage.getItem('pref_tema') || 'sistema';
    const salvaSom = localStorage.getItem('pref_som') === 'true';
    const salvaNotificacoes = localStorage.getItem('pref_notif') !== 'false';

    setConfigs(prev => ({
      ...prev,
      fonteDislexia: salvaDislexia,
      altoContraste: salvaContraste,
      tamanhoFonte: salvaTamanho,
      tema: salvaTema,
      feedbackSonoro: salvaSom,
      notificacoesAtivas: salvaNotificacoes
    }));

    aplicarClasses(salvaDislexia, salvaContraste, salvaTamanho);
    aplicarTema(salvaTema);
  }, []);

  const aplicarClasses = (dislexia: boolean, contraste: boolean, tamanho: string) => {
    const html = document.documentElement;

    if (dislexia) html.classList.add('fonte-dislexia');
    else html.classList.remove('fonte-dislexia');

    if (contraste) html.classList.add('alto-contraste');
    else html.classList.remove('alto-contraste');

    html.classList.remove('fonte-pequena', 'fonte-grande', 'fonte-extra');
    if (tamanho !== 'normal') {
      html.classList.add(`fonte-${tamanho}`);
    }
  };

  const aplicarTema = (novoTema: string) => {
    const html = document.documentElement;
    if (novoTema === 'escuro') {
      html.classList.add('tema-escuro');
      html.classList.remove('dark');
    } else {
      html.classList.remove('tema-escuro');
    }
  };

  const toggleDislexia = (checked: boolean) => {
    setConfigs({ ...configs, fonteDislexia: checked });
    localStorage.setItem('pref_dislexia', checked.toString());
    aplicarClasses(checked, configs.altoContraste, configs.tamanhoFonte);
  };

  const toggleContraste = (checked: boolean) => {
    setConfigs({ ...configs, altoContraste: checked });
    localStorage.setItem('pref_contraste', checked.toString());
    aplicarClasses(configs.fonteDislexia, checked, configs.tamanhoFonte);
  };

  const mudaTamanhoFonte = (tamanho: string) => {
    setConfigs({ ...configs, tamanhoFonte: tamanho });
    localStorage.setItem('pref_tamanho', tamanho);
    aplicarClasses(configs.fonteDislexia, configs.altoContraste, tamanho);
  };

  const mudaTema = (novoTema: string) => {
    setConfigs({ ...configs, tema: novoTema });
    localStorage.setItem('pref_tema', novoTema);
    aplicarTema(novoTema);
  };

  const toggleSom = (checked: boolean) => {
    setConfigs({ ...configs, feedbackSonoro: checked });
    localStorage.setItem('pref_som', checked.toString());
  };

  const toggleNotificacoes = (checked: boolean) => {
    setConfigs({ ...configs, notificacoesAtivas: checked });
    localStorage.setItem('pref_notif', checked.toString());
  };

  const baixarDadosLGPD = () => {
    const dados = JSON.stringify(configs, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'meus_dados_plataforma.json';
    link.click();

    URL.revokeObjectURL(url);
  };

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

  const passosSistema = [
    {
      passo: "1",
      titulo: "Configuração do Perfil Cognitivo",
      descricao: "No primeiro acesso, preencha o formulário inicial para calibrar os modelos de IA de acordo com o ritmo de aprendizado."
    },
    {
      passo: "2",
      titulo: "Integração com a Caixa Físicamente",
      descricao: "Conecte a caixa via USB ou rede local para sincronizar as configurações de voz e sensibilidade de toque feitas aqui."
    },
    {
      passo: "3",
      titulo: "Compartilhamento com Especialistas",
      descricao: "Se necessário, você pode gerar um link seguro para compartilhar o progresso diretamente com terapeutas ou educadores."
    }
  ];

  const itensFaq = [
    {
      pergunta: "Como funciona a fonte para dislexia?",
      resposta: "Ao ativar essa opção, o sistema altera a tipografia padrão para a OpenDyslexic. Essa fonte possui a base dos caracteres ligeiramente mais pesada, facilitando a leitura."
    },
    {
      pergunta: "Essas alterações afetam o funcionamento do hardware?",
      resposta: "Apenas as configurações da seção 'Áudio e Notificações'. O tamanho da fonte e alto contraste afetam apenas o visual deste painel web."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 dark:bg-slate-900 transition-colors duration-300">
      <div className="fixed top-0 left-0 md:left-64 right-0 h-1 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <header className="mb-8 pl-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Ajustes
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Personalize sua experiência na plataforma, acesse ferramentas de acessibilidade e ajuste o sistema.
        </p>
      </header>

      <form onSubmit={handleSaveConfigs} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Coluna 1: Interface & Acessibilidade */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-[#AC57EB]"/>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Interface & Acessibilidade</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5"/> TEMA VISUAL
                </label>
                <select 
                  value={configs.tema}
                  onChange={(e) => mudaTema(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="claro" className="cursor-pointer">Modo Claro</option>
                  <option value="escuro" className="cursor-pointer">Modo Escuro</option>
                  <option value="sistema" className="cursor-pointer">Acompanhar o Sistema</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5"/> TAMANHO DA FONTE
                </label>
                <select 
                  value={configs.tamanhoFonte}
                  onChange={(e) => mudaTamanhoFonte(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="pequeno" className="cursor-pointer">Pequeno</option>
                  <option value="normal" className="cursor-pointer">Normal (Padrão)</option>
                  <option value="grande" className="cursor-pointer">Grande</option>
                  <option value="extra" className="cursor-pointer">Extra Grande</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <Type className="w-5 h-5 text-purple-400 mt-0.5"/>
                    <div>
                      <p className="text-sm font-bold text-purple-900 dark:text-purple-300">Fonte para Dislexia</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400/80">Altera a tipografia global em tempo real.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={configs.fonteDislexia}
                      onChange={(e) => toggleDislexia(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AC57EB]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-slate-400 dark:text-slate-300 mt-0.5"/>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Alto Contraste</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Aumenta saturação e limites visuais.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={configs.altoContraste}
                      onChange={(e) => toggleContraste(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AC57EB]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Áudio e Notificações */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <Volume2 className="w-5 h-5 text-[#4078A4]"/>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Áudio e Notificações</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-slate-400 dark:text-slate-300 mt-0.5"/>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Feedback Sonoro (Beep)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sinalizar confirmação ao pressionar botões.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={configs.feedbackSonoro}
                    onChange={(e) => toggleSom(e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4078A4]"></div>
                </label>
              </div>

              {/* Notificações no Painel */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-slate-400 dark:text-slate-300 mt-0.5"/>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Notificações no Painel</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Receber alertas de progresso e vínculos.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={configs.notificacoesAtivas}
                    onChange={(e) => toggleNotificacoes(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4078A4]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacidade e Dados */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 dark:opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32 text-slate-900 dark:text-white"/>
            </div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
              <ShieldCheck className="w-5 h-5 text-emerald-500"/>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Privacidade e Dados</h3>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between mt-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Compartilhar Dados Anônimos</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">Ajuda a melhorar nossa IA cognitiva.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={configs.compartilharDados}
                    onChange={(e) => setConfigs({...configs, compartilharDados: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <button 
                type="button"
                onClick={baixarDadosLGPD}
                className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Exportar meus dados (LGPD)
              </button>
            </div>
          </div>
        </div>

        {/* Central de Ajuda */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm mt-2 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#4078A4]"/>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Central de Ajuda</h3>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl border border-slate-200/40 dark:border-slate-600/40">
              <button
                type="button"
                onClick={() => setAbaAjuda('tutoriais')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  abaAjuda === 'tutoriais' 
                    ? 'bg-white dark:bg-slate-600 text-[#4078A4] dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Como Funciona
              </button>
              <button
                type="button"
                onClick={() => setAbaAjuda('faq')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  abaAjuda === 'faq' 
                    ? 'bg-white dark:bg-slate-600 text-[#4078A4] dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Dúvidas Frequentes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Suporte Direto</p>
              <a href="#" className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-600 transition group cursor-pointer">
                <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-[#4078A4]" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Falar com o Suporte</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Tempo de resposta em até 2h</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-600 transition group cursor-pointer">
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-[#4078A4]" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Documentação Completa</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Manuais e notas de atualização</p>
                </div>
              </a>
            </div>

            <div className="md:col-span-2">
              {abaAjuda === 'tutoriais' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 mb-2">Fluxo de Navegação</p>
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-700 pl-4 ml-2 space-y-5">
                    {passosSistema.map((item, index) => (
                      <div key={index} className="relative">
                        <span className="absolute -left-[25px] top-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-inner">
                          {item.passo}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">{item.titulo}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">{item.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {abaAjuda === 'faq' && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Perguntas Comuns</p>
                  {itensFaq.map((item, index) => (
                    <div key={index} className="border border-slate-200/70 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-all">
                      <button
                        type="button"
                        onClick={() => alternarFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none cursor-pointer"
                      >
                        <span>{item.pergunta}</span>
                        {faqAberto === index ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>
                      {faqAberto === index && (
                        <div className="p-4 pt-0 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 leading-relaxed">
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