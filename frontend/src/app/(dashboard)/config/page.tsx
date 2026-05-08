

'use client';

import { useState } from 'react';
import { Bell, Save, Monitor, ShieldCheck, Type, Eye, Globe } from 'lucide-react';

export default function AjustesPage() {
const [saving, setSaving] = useState(false);

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

return (

  <form onSubmit={handleSaveConfigs} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700"
            >
              <option value="claro">Modo Claro</option>
              <option value="escuro">Modo Escuro (Em breve)</option>
              <option value="sistema">Acompanhar o Sistema</option>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#AC57EB] focus:ring-1 focus:ring-[#AC57EB] transition-all text-slate-700"
            >
              <option value="pequeno">Pequeno</option>
              <option value="normal">Normal (Padrão)</option>
              <option value="grande">Grande</option>
              <option value="extra">Extra Grande</option>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4078A4] focus:ring-1 focus:ring-[#4078A4] transition-all text-slate-700"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
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

    {/* Botão Salvar */}
    <div className="lg:col-span-2 flex justify-center mt-4">
      <button 
        type="submit" 
        disabled={saving}
        className="flex items-center gap-2 bg-gradient-to-r from-[#4078A4] to-[#3E89AE] text-white px-10 py-3.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50"
      >
        <Save className="w-5 h-5"/> 
        {saving ? 'Salvando ajustes...' : 'Salvar Ajustes'}
      </button>
    </div>
  </form>
);
}