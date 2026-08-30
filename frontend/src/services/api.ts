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
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// === Autenticação ===

// Cadastra um novo usuário.
// O backend devolve apenas os dados do usuário (NÃO um token) — para
// entrar automaticamente, o frontend chama login() logo em seguida.
export async function register(username: string, email: string, password: string) {
  return apiRequest<import('../types').User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

// Faz login e retorna o token + dados do usuário
export async function login(email: string, password: string) {
  return apiRequest<{ user: import('../types').User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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

// Envia solicitação de amizade
export async function sendFriendRequest(friendId: string) {
  return apiRequest<{ friendship: import('../types').Friendship }>('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ friend_id: friendId }),
  });
}

// Lista amizades do usuário logado
export async function getFriendships() {
  return apiRequest<import('../types').Friendship[]>('/friends');
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
