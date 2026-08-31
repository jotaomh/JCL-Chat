// hooks/useDirectMessages.ts — Conversa direta (DM) com um amigo
//
// Combina persistência (API REST) com tempo real (Phoenix):
//   - Ao montar/quando friendId mudar, busca o histórico via
//     GET /api/dms/{friendId}/messages e popula o estado inicial.
//   - Conecta no socket Phoenix autenticando com o JWT (padrão de useChat),
//     faz join no tópico determinado por getDmTopic(currentUserId, friendId).
//   - Escuta "new_message" e acrescenta ao estado, MAS ignora mensagens do
//     próprio usuário (essas já foram adicionadas localmente assim que o
//     POST respondeu — evita duplicar).
//   - sendMessage(body): faz POST /api/dms/{friendId}/messages para persistir
//     e, com a resposta salva, faz push("new_message") no canal para notificar
//     quem está online agora.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket, Channel } from 'phoenix';
import { useAuth } from './useAuth';
import { ChatMessage, DirectMessage } from '../types';
import { getDirectMessages, sendDirectMessage } from '../services/api';
import { getDmTopic } from '../utils/dmTopic';

const WS_URL = (import.meta.env.VITE_WS_URL || 'http://localhost:4000').replace(
  'http',
  'ws'
);

// Converte uma mensagem persistida (DirectMessage) no formato exibido
// pelo ChatArea (ChatMessage).
function toChatMessage(
  dm: DirectMessage,
  currentUserId: string,
  friendUsername?: string,
  ownUsername?: string
): ChatMessage {
  const isMine = dm.sender_id === currentUserId;
  return {
    user_id: dm.sender_id,
    username: isMine ? ownUsername ?? dm.sender_id : friendUsername ?? dm.sender_id,
    body: dm.body,
    timestamp: dm.created_at,
  };
}

export function useDirectMessages(friendId: string | null, friendUsername?: string) {
  const { token, user } = useAuth();
  const currentUserId = user?.id ?? '';
  const ownUsername = user?.username ?? '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    // Reseta o estado ao trocar de conversa
    setMessages([]);
    setConnected(false);
    if (!token || !friendId || !currentUserId) return;

    let cancelled = false;

    // 1) Busca o histórico persistido
    setLoading(true);
    getDirectMessages(friendId)
      .then((res) => {
        if (cancelled) return;
        setMessages(
          res.messages.map((dm) =>
            toChatMessage(dm, currentUserId, friendUsername, ownUsername)
          )
        );
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // 2) Conecta no socket e faz join no tópico da DM
    const socket = new Socket(WS_URL, {
      params: { token, ...(user ? { username: user.username } : {}) },
    });
    socket.onOpen(() => setConnected(true));
    socket.onError(() => setConnected(false));
    socket.onClose(() => setConnected(false));
    socket.connect();

    const topic = getDmTopic(currentUserId, friendId);
    const ch = socket.channel(topic);
    ch.on('new_message', (msg: ChatMessage) => {
      // Ignora mensagens do próprio usuário (já adicionadas via POST)
      if (msg.user_id === currentUserId) return;
      setMessages((prev) => [...prev, msg]);
    });
    ch.join()
      .receive('ok', () => setConnected(true))
      .receive('error', () => setConnected(false));

    socketRef.current = socket;
    channelRef.current = ch;

    return () => {
      cancelled = true;
      ch.leave();
      socket.disconnect();
      socketRef.current = null;
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, friendId, currentUserId]);

  const sendMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || !friendId || !currentUserId || !channelRef.current) return false;

      try {
        // 1) Persiste via API
        const saved = await sendDirectMessage(friendId, trimmed);
        // 2) Adiciona localmente (já vem com id/created_at do banco)
        setMessages((prev) => [
          ...prev,
          toChatMessage(saved, currentUserId, friendUsername, ownUsername),
        ]);
        // 3) Notifica quem está online por tempo real
        channelRef.current.push('new_message', {
          body: saved.body,
        });
        return true;
      } catch {
        return false;
      }
    },
    [friendId, currentUserId, friendUsername, ownUsername]
  );

  return { messages, sendMessage, connected, loading };
}
