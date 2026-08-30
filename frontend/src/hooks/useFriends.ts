// hooks/useFriends.ts — Carrega e gerencia amizades + pedidos de amizade
//
// Busca do backend dois conjuntos de dados (sempre que autenticado):
//   - friends:   os amigos de verdade (pedidos aceitos)
//   - requests:  pedidos pendentes RECEBIDOS pelo usuário logado
//
// Expõe funções que chamam a API e recarregam os dados automaticamente:
//   - sendRequest(username)      -> envia pedido de amizade
//   - acceptRequest(id)          -> aceita pedido recebido
//   - rejectRequest(id)          -> recusa pedido recebido
//   - removeFriend(id)           -> remove uma amizade

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Friend, FriendRequest } from '../types';
import {
  getFriends,
  getIncomingFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../services/api';

export function useFriends() {
  const { token } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  // Mensagem amigável a ser exibida na interface (sucesso ou erro)
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Busca amigos + pedidos pendentes
  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        getFriends(),
        getIncomingFriendRequests(),
      ]);
      setFriends(friendsRes.friends);
      setRequests(requestsRes.requests);
      setError(null);
    } catch (e) {
      setMessage(null);
      setError(e instanceof Error ? e.message : 'Falha ao carregar amigos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  // Envia pedido de amizade pelo username exato
  const sendRequest = useCallback(
    async (username: string) => {
      if (!token) return false;
      try {
        const res = await sendFriendRequest(username);
        setMessage(res.message || 'Pedido enviado!');
        setError(null);
        await refresh();
        return true;
      } catch (e) {
        setMessage(null);
        setError(e instanceof Error ? e.message : 'Não foi possível enviar o pedido.');
        return false;
      }
    },
    [token, refresh]
  );

  // Aceita um pedido recebido
  const acceptRequest = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        const res = await acceptFriendRequest(id);
        setMessage(res.message || 'Pedido aceito!');
        setError(null);
        await refresh();
      } catch (e) {
        setMessage(null);
        setError(e instanceof Error ? e.message : 'Não foi possível aceitar o pedido.');
      }
    },
    [token, refresh]
  );

  // Recusa um pedido recebido
  const rejectRequest = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await rejectFriendRequest(id);
        setMessage('Pedido recusado.');
        setError(null);
        await refresh();
      } catch (e) {
        setMessage(null);
        setError(e instanceof Error ? e.message : 'Não foi possível recusar o pedido.');
      }
    },
    [token, refresh]
  );

  // Remove uma amizade
  const removeFriend = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await removeFriend(id);
        setMessage('Amizade removida.');
        setError(null);
        await refresh();
      } catch (e) {
        setMessage(null);
        setError(e instanceof Error ? e.message : 'Não foi possível remover a amizade.');
      }
    },
    [token, refresh]
  );

  return {
    friends,
    requests,
    loading,
    message,
    error,
    refresh,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
}
