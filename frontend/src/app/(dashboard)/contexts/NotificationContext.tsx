'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getApiUrl } from '@/utils/api';

interface NotificationContextProps {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const NotificationContext = createContext<NotificationContextProps>({
  soundEnabled: true,
  toggleSound: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastNotifId = useRef<string | null>(null);
  

  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    const savedPreference = localStorage.getItem('cosmic_mind_sound_enabled');
    if (savedPreference !== null) {
      setSoundEnabled(JSON.parse(savedPreference));
    }
    

    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.load();
    }
  }, []);


  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem('cosmic_mind_sound_enabled', JSON.stringify(newState));
      return newState;
    });
  };


  useEffect(() => {
    const fetchNotificationsSilently = async () => {
      try {

        const notificacoesAtivas = localStorage.getItem('pref_notif') !== 'false';
        if (!notificacoesAtivas) return; 

        const dadosSalvos = JSON.parse(localStorage.getItem('user_data') || '{}');
        const token = dadosSalvos.token_acesso;
        if (!token) return;


        const res = await fetch(`${getApiUrl()}/notificacoes?_t=${Date.now()}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const notificacaoMaisRecente = data[0];


            if (lastNotifId.current === null) {
              lastNotifId.current = notificacaoMaisRecente.id;
              return;
            }


            if (lastNotifId.current !== notificacaoMaisRecente.id) {
              lastNotifId.current = notificacaoMaisRecente.id;
              
              if (soundEnabled && audioRef.current) {

                audioRef.current.currentTime = 0; 
                audioRef.current.play().catch(e => console.log("Áudio bloqueado:", e));
              }
            }
          }
        }
      } catch (error) {

      }
    };

    fetchNotificationsSilently();

    const interval = setInterval(fetchNotificationsSilently, 1500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotificationsSilently(); 
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [soundEnabled]);

  return (
    <NotificationContext.Provider value={{ soundEnabled, toggleSound }}>
      {children}
    </NotificationContext.Provider>
  );
};