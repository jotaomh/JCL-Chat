// pages/ChannelsPage.tsx — Página principal de canais e grupos
//
// Usa o AppLayout estilo Discord: trilho de ícones + lista lateral +
// área de chat. Nesta fase há só a sala "lobby" fixa (grupos de verdade
// virão na próxima etapa), mas a estrutura já está pronta pra crescer.

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useChat } from '../hooks/useChat';
import { AppLayout } from '../components/layout/AppLayout';
import { ChatArea } from '../components/layout/ChatArea';
import { AppSelection, ServerItem } from '../types';

// Grupo/comunidade único por enquanto: "lobby"
const SERVERS: ServerItem[] = [
  { id: 'lobby', name: 'lobby', channels: [{ id: 'lobby', name: 'lobby' }] },
];

export function ChannelsPage() {
  const { logout, user } = useAuth();
  const { toggleTheme } = useTheme();  const { messages, sendMessage, connected } = useChat();

  const [selection, setSelection] = useState<AppSelection>({
    type: 'channel',
    serverId: 'lobby',
    channelId: 'lobby',
  });

  const isFriends = selection.type === 'friends';
  const roomName =
    selection.type === 'channel' ? selection.channelId : 'amigos';

  return (
    <AppLayout
      servers={SERVERS}
      selection={selection}
      onSelect={setSelection}
      userLabel={user?.username}
      onLogout={logout}
      onToggleTheme={toggleTheme}
    >
      {isFriends ? (
        <section className="chat-area">
          <header className="chat-header">
            <h2 className="chat-header-title">Amigos</h2>
          </header>
          <div className="chat-messages">
            <p className="chat-empty">Suas mensagens diretas aparecerão aqui.</p>
          </div>
        </section>
      ) : (
        <ChatArea
          roomName={roomName}
          connected={connected}
          messages={messages}
          onSend={sendMessage}
        />
      )}
    </AppLayout>
  );
}
