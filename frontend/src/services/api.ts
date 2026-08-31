// services/api.ts — Cliente HTTP para a API FastAPI (Python)
//
// Usa fetch nativo do navegador.
// No futuro podemos migrar para axios ou react-query se necessário.
//
// Como funciona:
//   1. Cada função exportada faz uma requisição HTTP para o backend
//   2. As URLs base vêm das variáveis de ambiente VITE_API_URL
//   3. O token de autenticação é enviado no header Authorization

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Todas as rotas da API FastAPI são servidas sob o prefixo /api.
const API_PREFIX = '/api';

// Obtém o token de autenticação do localStorage
function getToken(): string | null {
  return localStorage.getItem('token');
}

// Headers padrão para requisições autenticadas
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Wrapper genérico para fetch
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    let message = `HTTP ${response.status}`;
    if (body?.detail) {
      if (typeof body.detail === 'string') {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        // Erros de validação do FastAPI vêm como array de { msg, loc, ... }.
        // Ex.: cadastro com data de nascimento inválida. Junta as mensagens
        // para mostrar algo legível ao usuário (em vez de "[object Object]").
        const msgs = body.detail
          .map((d: { msg?: unknown }) => d.msg)
          .filter((m: unknown): m is string => typeof m === 'string');
        if (msgs.length > 0) message = msgs.join('; ');
      }
    }
    throw new Error(message);
  }

  return response.json();
}

// === Autenticação ===

// Cadastra um novo usuário.
// O backend devolve apenas os dados do usuário (NÃO um token) — para
// entrar automaticamente, o frontend chama login() logo em seguida.
// "birth_date" é a data de nascimento (o backend valida a idade mínima).
export async function register(
  username: string,
  email: string,
  password: string,
  birthDate: string
) {
  return apiRequest<import('../types').User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, birth_date: birthDate }),
  });
}

// Faz login e retorna o token + dados do usuário
export async function login(email: string, password: string) {
  return apiRequest<{ user: import('../types').User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// === Recuperação de senha ===

// Inicia a recuperação de senha. O backend sempre responde a mesma mensagem
// (não revela se o e-mail está cadastrado) e, nesta fase, apenas loga o link
// de recuperação no console do servidor.
export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Redefine a senha usando o token recebido por e-mail/link.
export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

// === Usuários ===

// Retorna os dados do usuário autenticado (via token JWT).
// Usado para verificar se o token ainda é válido.
export async function getMe() {
  return apiRequest<import('../types').User>('/users/me');
}

// Lista todos os usuários
export async function getUsers() {
  return apiRequest<import('../types').User[]>('/users');
}

// Obtém um usuário pelo ID
export async function getUserById(id: string) {
  return apiRequest<import('../types').User>(`/users/${id}`);
}

// === Amizades ===

// Envia solicitação de amizade buscando pelo username exato (ex.: "@joao")
export async function sendFriendRequest(username: string) {
  return apiRequest<{ message: string }>('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

// Lista os amigos de verdade (pedidos aceitos)
export async function getFriends() {
  return apiRequest<{ friends: import('../types').Friend[] }>('/friends');
}

// Lista pedidos pendentes RECEBIDOS pelo usuário logado
export async function getIncomingFriendRequests() {
  return apiRequest<{ requests: import('../types').FriendRequest[] }>(
    '/friends/requests'
  );
}

// Lista pedidos pendentes ENVIADOS pelo usuário logado ("aguardando resposta")
export async function getSentFriendRequests() {
  return apiRequest<{ requests: import('../types').FriendRequest[] }>(
    '/friends/requests/sent'
  );
}

// Aceita um pedido recebido
export async function acceptFriendRequest(requestId: string) {
  return apiRequest<{ message: string }>(`/friends/requests/${requestId}/accept`, {
    method: 'POST',
  });
}

// Recusa um pedido recebido
export async function rejectFriendRequest(requestId: string) {
  return apiRequest<{ message: string }>(`/friends/requests/${requestId}/reject`, {
    method: 'POST',
  });
}

// Remove uma amizade pelo id do amigo
export async function removeFriend(friendId: string) {
  return apiRequest<{ message: string }>(`/friends/${friendId}`, {
    method: 'DELETE',
  });
}

// === Grupos ===

// Cria um novo grupo
export async function createGroup(name: string, description?: string) {
  return apiRequest<import('../types').Group>('/groups', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

// Lista grupos do usuário
export async function getGroups() {
  return apiRequest<import('../types').Group[]>('/groups');
}

// === Mensagens ===

// Busca mensagens de um canal
export async function getMessages(channelId: string) {
  return apiRequest<import('../types').Message[]>(`/channels/${channelId}/messages`);
}

// Salva uma mensagem
export async function sendMessage(channelId: string, content: string) {
  return apiRequest<import('../types').Message>(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// === Mensagens diretas (DMs) ===

// Histórico de uma conversa direta com um amigo (ordenado por created_at)
export async function getDirectMessages(friendId: string) {
  return apiRequest<import('../types').DirectMessagesResponse>(
    `/dms/${friendId}/messages`
  );
}

// Persiste uma mensagem direta para um amigo
export async function sendDirectMessage(friendId: string, body: string) {
  return apiRequest<import('../types').DirectMessage>(`/dms/${friendId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}
