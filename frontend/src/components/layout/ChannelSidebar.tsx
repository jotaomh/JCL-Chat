// components/layout/ChannelSidebar.tsx — Lista lateral (coluna 2)
//
// Dependendo da seleção no trilho de ícones:
//   - "Amigos" -> lista de amigos (hoje vazia, reaproveita /api/friends)
//   - grupo    -> lista de canais do grupo (por ora, só "lobby")
//
// Deixe o ChatArea decidir o que renderizar no painel; aqui só
// fornecemos os dados de navegação lateral.

import { useState } from 'react';
import { ServerItem, AppSelection } from '../../types';
import { useFriends } from '../../hooks/useFriends';

interface ChannelSidebarProps {
  servers: ServerItem[];
  selection: AppSelection;
  onSelectChannel: (serverId: string, channelId: string) => void;
}

function FriendsSidebar() {
  const {
    friends,
    requests,
    loading,
    message,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriends();

  const [username, setUsername] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await sendRequest(username);
    if (ok) setUsername('');
  };

  return (
    <aside className="channel-sidebar">
      <div className="sidebar-heading">
        <input
          type="text"
          className="sidebar-search"
          placeholder="Buscar"
          readOnly
        />
      </div>

      {/* Feed de mensagens (sucesso/erro vindos da API) */}
      {message && <div className="friends-feedback friends-feedback-ok">{message}</div>}
      {error && <div className="friends-feedback friends-feedback-err">{error}</div>}

      {/* Formulário "Adicionar amigo" */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Adicionar amigo</h3>
        <form className="add-friend-form" onSubmit={handleSend}>
          <input
            type="text"
            className="add-friend-input"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="add-friend-btn" disabled={!username.trim()}>
            Adicionar
          </button>
        </form>
      </div>

      {/* Pedidos pendentes recebidos */}
      {requests.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">
            Pedidos de amizade ({requests.length})
          </h3>
          <ul className="sidebar-list">
            {requests.map((req) => (
              <li key={req.id} className="friend-row friend-request">
                <span className="friend-name">{req.username}</span>
                <div className="friend-actions">
                  <button
                    type="button"
                    className="friend-action accept"
                    onClick={() => acceptRequest(req.id)}
                    aria-label="Aceitar"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="friend-action reject"
                    onClick={() => rejectRequest(req.id)}
                    aria-label="Recusar"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de amigos */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Amigos</h3>
        {loading && friends.length === 0 ? (
          <p className="sidebar-empty">Carregando…</p>
        ) : friends.length === 0 ? (
          <p className="sidebar-empty">Você ainda não tem amigos.</p>
        ) : (
          <ul className="sidebar-list">
            {friends.map((friend) => (
              <li key={friend.id} className="friend-row">
                <span className="friend-status-dot" title="offline" />
                <span className="friend-name">{friend.username}</span>
                <button
                  type="button"
                  className="friend-remove"
                  onClick={() => removeFriend(friend.id)}
                  aria-label={`Remover ${friend.username}`}
                  title="Remover amizade"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export function ChannelSidebar({
  servers,
  selection,
  onSelectChannel,
}: ChannelSidebarProps) {
  if (selection.type === 'friends') {
    return <FriendsSidebar />;
  }

  const server = servers.find((s) => s.id === selection.serverId);

  if (!server) {
    return (
      <aside className="channel-sidebar">
        <p className="sidebar-empty">Nenhum grupo selecionado.</p>
      </aside>
    );
  }

  return (
    <aside className="channel-sidebar">
      <div className="sidebar-server-name">
        <span className="server-name-text">{server.name}</span>
        <span className="server-name-chevron">▾</span>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Canais de texto</h3>
        <ul className="sidebar-list">
          {server.channels.map((channel) => {
            const active =
              selection.type === 'channel' &&
              selection.channelId === channel.id;
            return (
              <li key={channel.id}>
                <button
                  type="button"
                  className={`sidebar-channel ${active ? 'active' : ''}`}
                  onClick={() => onSelectChannel(server.id, channel.id)}
                >
                  <span className="channel-hash">#</span>
                  <span className="channel-name">{channel.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
