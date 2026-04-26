export default function Home() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">👋 Olá, bem-vindo ao painel!</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-4">
          Este é o painel administrativo do Cosmic Mind. Use o menu ao lado para navegar.
        </p>
        <ul className="list-disc list-inside text-slate-600 space-y-2">
          <li>Acompanhar o desempenho do jogador</li>
          <li>Personalizar perfis</li>
          <li>Ver relatórios e fases</li>
        </ul>
      </div>
    </div>
  );
}