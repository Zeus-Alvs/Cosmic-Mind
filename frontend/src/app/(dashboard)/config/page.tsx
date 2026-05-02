export default function NomeDaPagina() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center">
         {/* 🔝 barra (respeita menu) */}
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />
        <h2 className="text-3xl font-bold text-slate-800">Título da Página</h2>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400">Conteúdo em construção...</p>
      </div>
    </div>
  );
}