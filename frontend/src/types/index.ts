// types/index.ts — Definições de tipos compartilhados por toda a aplicação
// Centraliza os tipos TypeScript usados no frontend

// Usuário
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away';
  created_at: string;
}

// Amizade
export interface Friendship {
  id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// Grupo / Comunidade
export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  member_count: number;
  created_at: string;
}

// Canal de chat
export interface Channel {
  id: string;
  group_id: string;
  name: string;
  channel_type: 'text' | 'voice' | 'video' | 'screen_share';
  created_at: string;
}

// Mensagem
export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at: string;
}

// Chamada (voz/vídeo)
export interface Call {
  id: string;
  channel_id: string;
  participants: string[];
  call_type: 'voice' | 'video';
  status: 'active' | 'ended';
  started_at?: string;
}

// Estados da aplicação (para quando usarmos um gerenciador de estado)
export interface AppState {
  currentUser: User | null;
  friends: Friendship[];
  groups: Group[];
  currentChannel: Channel | null;
  messages: Message[];
}
