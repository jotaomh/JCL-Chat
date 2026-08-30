// hooks/useChat.ts — Hook customizado para o chat em tempo real (Phoenix)
//
// Encapsula a conexão com o servidor Phoenix de tempo real:
//   - conecta ao socket autenticando com o JWT guardado pelo useAuth
//   - faz join no canal "room:lobby"
//   - escuta o evento "new_message" e acumula as mensagens
//   - expõe sendMessage() para enviar novas mensagens
//
// O phoenix.js já cuida de reconexão automática; aqui só garantimos que
// a lógica não trave a UI.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from './useAuth';
import { ChatMessage } from '../types';

const WS_URL = (import.meta.env.VITE_WS_URL || 'http://localhost:4000').replace(
  'http',
  'ws'
);
const ROOM_TOPIC = 'room:lobby';

export function useChat() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);

  // Conecta ao socket (com o token) e faz join na sala
  useEffect(() => {
    if (!token) return;

    const socket = new Socket(WS_URL, {
      params: { token, ...(user ? { username: user.username } : {}) },
    });
    socket.onOpen(() => setConnected(true));
    socket.onError(() => setConnected(false));
    socket.onClose(() => setConnected(false));
    socket.connect();

    const ch = socket.channel(ROOM_TOPIC);
    ch.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    ch.join()
      .receive('ok', () => setConnected(true))
      .receive('error', () => setConnected(false));

    socketRef.current = socket;
    channelRef.current = ch;
    setChannel(ch);

    // Limpa a conexão ao desmontar
    return () => {
      ch.leave();
      socket.disconnect();
      socketRef.current = null;
      channelRef.current = null;
      setChannel(null);
    };
    // o token/user vêm de hooks; conectar só quando autenticado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sendMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !channelRef.current) return;
      channelRef.current
        .push('new_message', { body: trimmed })
        .receive('error', () => {
          // silencioso por enquanto — apenas não adiciona a mensagem
        });
    },
    []
  );

  return { messages, sendMessage, connected, channel };
}
