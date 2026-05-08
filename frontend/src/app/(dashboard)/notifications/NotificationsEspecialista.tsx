'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bell, UserCheck, TrendingUp, ChevronRight, Star, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Interface idêntica à do Responsável para manter a consistência do Back-end
interface NotificationDTO {
  id: string;
  type: 'aceite' | 'desempenho' | 'sistema' | 'alerta';
  title: string;
  description: string;
  createdAt: string; 
  isLink?: boolean;
  linkTo?: string;
}

export default function NotificationsS() {
  const router = useRouter();
  const [filter, setFilter] = useState<'recentes' | 'antigas' | '30dias'>('recentes');
  const [notificationsData, setNotificationsData] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
   
      const mockApiResponse: NotificationDTO[] = [
        {
          id: "s-1",
          type: 'aceite',
          title: 'Solicitação Aceita',
          description: 'Carla aceitou sua solicitação para acompanhar o Davi.',
          createdAt: new Date().toISOString(),
          isLink: true,
          linkTo: '/manager' // Joga para a gerência de pacientes
        },
        {
          id: "s-2",
          type: 'desempenho',
          title: 'Novo Relatório Disponível',
          description: 'O desempenho de Davi na fase "Foco Total" foi atualizado.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          isLink: true,
          linkTo: '/performance'
        },
        {
          id: "s-3",
          type: 'aceite',
          title: 'Vínculo Estabelecido',
          description: 'Você agora tem acesso aos dados de Maria Eduarda.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          isLink: false
        },
        {
          id: "s-4",
          type: 'alerta',
          title: 'Ausência de Atividade',
          description: 'O paciente Davi não realiza atividades há 3 dias.',
          createdAt: "2026-04-29T09:00:00.000Z",
          isLink: false
        }
      ];

      setTimeout(() => {
        setNotificationsData(mockApiResponse);
        setIsLoading(false);
      }, 600);
    };

    fetchNotifications();
  }, []);

  // Mapeamento de ícones específico para a visão do Especialista
  const getIconConfig = (type: NotificationDTO['type']) => {
    const configs = {
      aceite: { icon: <UserCheck className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-100' },
      desempenho: { icon: <TrendingUp className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-100' },
      alerta: { icon: <Bell className="w-5 h-5 text-red-500" />, bg: 'bg-red-100' },
      sistema: { icon: <Star className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-100' },
    };
    return configs[type] || { icon: <ClipboardList className="w-5 h-5 text-slate-500" />, bg: 'bg-slate-100' };
  };

  const filteredList = useMemo(() => {
    let list = notificationsData.map(n => ({ ...n, dateObj: new Date(n.createdAt) }));
    if (filter === '30dias') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      list = list.filter(n => n.dateObj >= thirtyDaysAgo);
    }
    filter === 'recentes' 
      ? list.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      : list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    return list;
  }, [filter, notificationsData]);

  if (isLoading) return <div className="flex justify-center p-20 text-slate-400 animate-pulse">Carregando painel do especialista...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Painel de Notificações
        </h2>
        <p className="text-slate-400 text-xs font-medium">Gestão de vínculos e acompanhamento clínico</p>
      </header>

      <div className="flex justify-end mb-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 shadow-inner">
          {['recentes', 'antigas', '30dias'].map((t) => (
            <button 
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase ${
                filter === t ? 'bg-white text-[#AC57EB] shadow-sm' : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              {t === '30dias' ? '30 DIAS' : t}
            </button>
          ))}
        </div>
      </div>

      <main className="space-y-3">
        {filteredList.map((notif) => {
          const { icon, bg } = getIconConfig(notif.type);
          return (
            <div key={notif.id} className="bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-[#AC57EB]/30">
              <div className="flex items-center gap-4 flex-1">
                <div className={`${bg} p-2.5 rounded-xl flex-shrink-0`}>{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-slate-700 text-sm truncate">{notif.title}</h4>
                    <span className="text-[9px] font-black text-[#4078A4] uppercase">
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate pr-4">{notif.description}</p>
                </div>
              </div>

              {notif.isLink && (
                <button 
                  onClick={() => router.push(notif.linkTo || '/')}
                  className="flex items-center gap-1.5 bg-[#AC57EB]/10 text-[#AC57EB] px-4 py-2 rounded-2xl text-[10px] font-black hover:bg-[#AC57EB] hover:text-white transition-all group shrink-0"
                >
                  CONFIRA
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}