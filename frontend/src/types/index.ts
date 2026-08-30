// types/index.ts — Definições de tipos compartilhados por toda a aplicação
// Centraliza os tipos TypeScript usados no frontend

// Usuário
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away';
  // Data de nascimento (YYYY-MM-DD). Usamos a data (não a idade) porque a
  // idade é calculada na hora quando exibimos — fica sempre atualizada.
  birth_date?: string;
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

// Mensagem de tempo real (via Phoenix channels)
export interface ChatMessage {
  user_id: string;
  username: string;
  body: string;
  timestamp: string;
}

// Canal de texto dentro de um grupo (fase inicial: sempre "lobby")
export interface ServerChannel {
  id: string;
  name: string;
}

// Grupo/comunidade exibido no trilho de ícones (fase inicial: "lobby")
export interface ServerItem {
  id: string;
  name: string;
  channels: ServerChannel[];
}

// Seleção atual no layout: "Amigos"/DMs ou um canal específico de um grupo
export type AppSelection =
  | { type: 'friends' }
  | { type: 'channel'; serverId: string; channelId: string };
