'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bell, Zap, Trophy, ChevronRight, Star, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/api'; 

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
      setIsLoading(true);
      try {
        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;

        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${getApiUrl()}/notificacoes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setNotificationsData(data);
        } else {
          console.error("Erro na resposta da API de notificações.");
        }
      } catch (error) {
        console.error("Erro ao buscar notificações", error);
      } finally {
        setIsLoading(false);
      }
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

    // Limita para no máximo 10 itens antes de renderizar
    return list.slice(0, 10);
  }, [filter, notificationsData]);

  if (isLoading) return <div className="flex justify-center p-20 text-slate-400 animate-pulse">Carregando notificações...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="fixed top-0 left-0 md:left-64 right-0 h-3 bg-gradient-to-r from-[#AC57EB] via-[#4078A4] to-[#3E89AE] z-50" />

      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4078A4] to-[#AC57EB] bg-clip-text text-transparent mb-1">
          Notificações
        </h2>
        <p className="text-slate-400 text-xs font-medium">Acompanhe os jogadores em tempo real</p>
      </header>

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
        {filteredList.length === 0 ? (
          <div className="text-center p-10 text-slate-400 border border-dashed border-slate-200 rounded-3xl">
            Nenhuma notificação encontrada.
          </div>
        ) : (
          filteredList.map((notif) => {
            const { icon, bg } = getIconConfig(notif.type);
            return (
              <div
                key={notif.id}
                className="bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#4078A4]/30"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 w-full">
                  <div className={`${bg} p-2.5 rounded-xl flex-shrink-0`}>
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-0.5 gap-1 sm:gap-0">
                      <h4 className="font-bold text-slate-700 text-sm truncate">{notif.title}</h4>
                      <span className="text-[9px] font-black text-[#AC57EB] uppercase shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 sm:truncate pr-0 sm:pr-4">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {notif.isLink && (
                  <button
                    onClick={() => router.push(notif.linkTo || '/')}
                    className="flex items-center justify-center gap-1.5 bg-[#4078A4]/10 text-[#4078A4] px-4 py-2 rounded-2xl text-[10px] font-black hover:bg-[#4078A4] hover:text-white transition-all group shrink-0 cursor-pointer w-full sm:w-auto"
                  >
                    CONFIRA
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}