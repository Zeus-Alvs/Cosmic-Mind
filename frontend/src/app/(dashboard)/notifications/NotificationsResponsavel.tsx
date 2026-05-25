'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bell, Zap, Trophy, ChevronRight, Star, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationDTO {
  id: string;
  type: 'pausa' | 'solicitacao' | 'conquista' | 'novidade' | 'info';
  title: string;
  description: string;
  createdAt: string;
  isLink?: boolean;
  linkTo?: string;
}

export default function NotificationsR() {
  const router = useRouter();
  const [filter, setFilter] = useState<'recentes' | 'antigas' | '30dias'>('recentes');

  const [notificationsData, setNotificationsData] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const mockApiResponse: NotificationDTO[] = [
        {
          id: "uuid-1",
          type: 'pausa',
          title: 'Pausa Ativada',
          description: 'Recarregando às energias! Davi poderá jogar em 2h.',
          createdAt: new Date().toISOString(),
          isLink: false
        },
        {
          id: "uuid-2",
          type: 'solicitacao',
          title: 'Nova Solicitação',
          description: 'Regina Ribeiro quer acompanhar o desempenho de Ana Silva.',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          isLink: true,
          linkTo: '/requests/R'
        },
        {
          id: "uuid-3",
          type: 'conquista',
          title: 'Parabénsss!',
          description: 'Davi acabou de avançar mais uma fase.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          isLink: false
        },
        {
          id: "uuid-4",
          type: 'novidade',
          title: 'Novo Jogo Liberado',
          description: 'O desafio "Memória Espacial" está disponível para o Davi.',
          createdAt: "2026-04-28T10:00:00.000Z",
          isLink: false
        },
        {
          id: "uuid-5",
          type: 'info',
          title: 'Relatório Semanal',
          description: 'O resumo da semana do Davi já está pronto para leitura.',
          createdAt: "2026-04-20T14:30:00.000Z",
          isLink: false
        }
      ];

      setTimeout(() => {
        setNotificationsData(mockApiResponse);
        setIsLoading(false);
      }, 800);
    };

    fetchNotifications();
  }, []);

  const getIconConfig = (type: NotificationDTO['type']) => {
    const configs = {
      pausa: { icon: <Zap className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-100' },
      solicitacao: { icon: <Bell className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-100' },
      conquista: { icon: <Trophy className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-100' },
      novidade: { icon: <Star className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-100' },
      info: { icon: <Info className="w-5 h-5 text-slate-500" />, bg: 'bg-slate-100' },
    };
    return configs[type] || configs.info;
  };

  const filteredList = useMemo(() => {
    let list = notificationsData.map(n => ({
      ...n,
      dateObj: new Date(n.createdAt)
    }));

    if (filter === '30dias') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      list = list.filter(n => n.dateObj >= thirtyDaysAgo);
    }

    if (filter === 'recentes') {
      list.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    } else {
      list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }

    return list;
  }, [filter, notificationsData]);

  if (isLoading) return <div className="flex justify-center p-20 text-slate-400 animate-pulse">Carregando notificações...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="fixed top-0 left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Notificações
        </h2>
        <p className="text-slate-400 text-xs font-medium">Acompanhe os jogadores em tempo real</p>
      </header>

      {}
      <div className="flex justify-end mb-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 shadow-inner">
          {[
            { id: 'recentes', label: 'RECENTES' },
            { id: 'antigas', label: 'ANTIGAS' },
            { id: '30dias', label: '30 DIAS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                filter === tab.id ? 'bg-white text-[#4078A4] shadow-sm' : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="space-y-3">
        {filteredList.map((notif) => {
          const { icon, bg } = getIconConfig(notif.type);
          return (
            <div
              key={notif.id}
              className="bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-[#4078A4]/30"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`${bg} p-2.5 rounded-xl flex-shrink-0`}>
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-slate-700 text-sm truncate">{notif.title}</h4>
                    <span className="text-[9px] font-black text-[#AC57EB] uppercase">
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate pr-4">
                    {notif.description}
                  </p>
                </div>
              </div>

              {notif.isLink && (
                <button
                  onClick={() => router.push(notif.linkTo || '/')}
                  className="flex items-center gap-1.5 bg-[#4078A4]/10 text-[#4078A4] px-4 py-2 rounded-2xl text-[10px] font-black hover:bg-[#4078A4] hover:text-white transition-all group shrink-0 cursor-pointer"
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